import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AppState,
  Linking,
} from "react-native";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";

import { useAuth } from "./AuthContext";

import {
  META_CM,
  cuentaInicial,
  tramoValido,
} from "../utils/caminaCore";

import {
  prepararMision,
  sincronizarMision,
  canjearPremio,
} from "../services/caminaService";

const Contexto = createContext(null);

export function CaminaProvider({ children }) {
  const { cuenta } = useAuth();

  return (
    <Proveedor
      key={cuenta.uid}
      uid={cuenta.uid}
    >
      {children}
    </Proveedor>
  );
}

function Proveedor({ uid, children }) {
  const clave =
    `@inkapark/camina/v1/${uid}`;

  const [nube, setNube] =
    useState(cuentaInicial);

  const [cm, setCm] = useState(0);
  const [listo, setListo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [caminando, setCaminando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [pasos, setPasos] = useState(0);
  const [sensor, setSensor] =
    useState("Sin iniciar");

  const [velocidad, setVelocidad] =
    useState(0);

  const [precision, setPrecision] =
    useState(null);

  const [permiso, setPermiso] =
    useState(null);

  const [cerrada, setCerrada] =
    useState(false);

  const refCm = useRef(0);
  const montado = useRef(true);
  const bloqueo = useRef(false);
  const activa = useRef(false);

  const gps = useRef(null);
  const podometro = useRef(null);
  const anterior = useRef(null);

  const generacion = useRef(0);
  const pasosRef = useRef(0);
  const ultimoPaso = useRef(0);
  const usaPasos = useRef(false);

  const guardando = useRef(
    Promise.resolve()
  );

  const persistir = useCallback(
    (valor) => {
      // Serializa las escrituras locales para evitar
      // que una escritura antigua termine después.
      const trabajo = guardando.current
        .catch(() => {})
        .then(() =>
          AsyncStorage.setItem(
            clave,
            JSON.stringify({
              distanciaCm: valor,
            })
          )
        );

      guardando.current = trabajo;

      trabajo.catch(() => {
        if (montado.current) {
          setMensaje(
            "No se pudo guardar el progreso local. Pausa y revisa el almacenamiento."
          );
        }
      });

      return trabajo;
    },
    [clave]
  );

  const detener = useCallback(() => {
    generacion.current += 1;
    activa.current = false;

    gps.current?.remove();
    gps.current = null;

    podometro.current?.remove();
    podometro.current = null;

    anterior.current = null;

    if (montado.current) {
      setCaminando(false);
      setVelocidad(0);
    }
  }, []);

  async function cargar() {
    if (bloqueo.current) return;

    bloqueo.current = true;
    setCargando(true);
    setMensaje("");

    try {
      const texto =
        await AsyncStorage.getItem(clave);

      const local = texto
        ? JSON.parse(texto).distanciaCm
        : 0;

      if (
        !Number.isInteger(local) ||
        local < 0 ||
        local > META_CM
      ) {
        throw new Error(
          "El progreso local tiene un formato inválido."
        );
      }

      const cuenta =
        await prepararMision(uid);

      if (!montado.current) return;

      const valor = Math.min(
        META_CM,
        Math.max(
          local,
          cuenta.distanciaCm
        )
      );

      refCm.current = valor;
      setCm(valor);
      setNube(cuenta);

      await persistir(valor);

      if (montado.current) {
        setListo(true);
      }
    } catch (error) {
      if (montado.current) {
        setMensaje(
          error.message ||
          "Conéctate para preparar la misión."
        );
      }
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setCargando(false);
      }
    }
  }

  useEffect(() => {
    montado.current = true;
    cargar();

    return () => {
      montado.current = false;
      detener();
    };
  }, []);

  async function sincronizar() {
    if (!listo || bloqueo.current) return;

    bloqueo.current = true;
    setOcupado(true);

    try {
      await persistir(refCm.current);

      const cuenta =
        await sincronizarMision(
          refCm.current,
          uid
        );

      if (!montado.current) return;

      refCm.current = Math.max(
        refCm.current,
        cuenta.distanciaCm
      );

      setCm(refCm.current);
      setNube(cuenta);

      await persistir(refCm.current);

      if (montado.current) {
        setMensaje(
          cuenta.metaCompleta
            ? "¡Misión completada! Puedes canjear las recompensas que todavía no hayas reclamado."
            : "Progreso confirmado en Firebase."
        );
      }
    } catch (error) {
      if (montado.current) {
        setMensaje(
          "Progreso local conservado. No se pudo sincronizar: " +
          (
            error.message ||
            "revisa Internet."
          )
        );
      }
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
      }
    }
  }

  async function pausar() {
    const estabaCaminando =
      activa.current;

    detener();

    if (estabaCaminando) {
      await sincronizar();
    }
  }

  const pausaRef = useRef(pausar);
  pausaRef.current = pausar;

  useEffect(() => {
    const suscripcion =
      AppState.addEventListener(
        "change",
        (estado) => {
          if (estado !== "active") {
            if (activa.current) {
              pausaRef.current();
            }
          } else {
            Location
              .getForegroundPermissionsAsync()
              .then((respuesta) => {
                if (montado.current) {
                  setPermiso(respuesta);
                }
              })
              .catch(() => {});
          }
        }
      );

    return () => suscripcion.remove();
  }, []);

  async function iniciar() {
    if (
      !listo ||
      bloqueo.current ||
      activa.current ||
      refCm.current >= META_CM
    ) {
      return;
    }

    bloqueo.current = true;
    setOcupado(true);
    setMensaje("");

    const version =
      ++generacion.current;

    try {
      let respuesta =
        await Location
          .getForegroundPermissionsAsync();

      if (
        !respuesta.granted &&
        respuesta.canAskAgain
      ) {
        respuesta =
          await Location
            .requestForegroundPermissionsAsync();
      }

      if (montado.current) {
        setPermiso(respuesta);
      }

      if (!respuesta.granted) {
        throw new Error(
          respuesta.canAskAgain
            ? "Necesitamos ubicación para medir tu recorrido."
            : "Activa la ubicación desde Ajustes."
        );
      }

      const gpsDisponible =
        await Location
          .hasServicesEnabledAsync();

      if (!gpsDisponible) {
        throw new Error(
          "Enciende la ubicación/GPS del teléfono."
        );
      }

      pasosRef.current = 0;
      ultimoPaso.current = 0;
      usaPasos.current = false;

      setPasos(0);
      setSensor(
        "GPS; pasos no disponibles"
      );

      try {
        const disponible =
          await Pedometer.isAvailableAsync();

        if (disponible) {
          let permisoPasos =
            await Pedometer.getPermissionsAsync();

          if (
            !permisoPasos.granted &&
            permisoPasos.canAskAgain
          ) {
            permisoPasos =
              await Pedometer
                .requestPermissionsAsync();
          }

          if (permisoPasos.granted) {
            usaPasos.current = true;
            setSensor("GPS + pasos");
          } else {
            setSensor(
              "GPS; permiso de pasos no concedido"
            );
          }
        }
      } catch {
        setSensor(
          "GPS; pasos no disponibles"
        );
      }

      if (
        !montado.current ||
        version !== generacion.current ||
        AppState.currentState !== "active"
      ) {
        throw new Error(
          "Vuelve a la app y pulsa Iniciar para continuar."
        );
      }

      if (usaPasos.current) {
        podometro.current =
          Pedometer.watchStepCount(
            ({ steps }) => {
              pasosRef.current = steps;

              if (montado.current) {
                setPasos(steps);
              }
            }
          );
      }

      anterior.current = null;
      activa.current = true;
      setCaminando(true);

      const suscripcion =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 2,
          },
          (posicion) => {
            if (
              !activa.current ||
              version !== generacion.current ||
              !montado.current ||
              AppState.currentState !== "active"
            ) {
              return;
            }

            setPrecision(
              posicion.coords.accuracy
            );

            const tramo = tramoValido(
              anterior.current,
              posicion
            );

            if (tramo.reiniciar) {
              const calidadValida =
                posicion.coords.accuracy != null &&
                posicion.coords.accuracy <= 20;

              anterior.current =
                calidadValida
                  ? posicion
                  : null;

              ultimoPaso.current =
                pasosRef.current;

              return;
            }

            if (!tramo.metros) return;

            if (
              usaPasos.current &&
              pasosRef.current <=
                ultimoPaso.current
            ) {
              return;
            }

            const segundos =
              (
                posicion.timestamp -
                anterior.current.timestamp
              ) / 1000;

            setVelocidad(
              tramo.metros / segundos * 3.6
            );

            anterior.current = posicion;

            ultimoPaso.current =
              pasosRef.current;

            const valor = Math.min(
              META_CM,
              refCm.current +
                Math.round(
                  tramo.metros * 100
                )
            );

            refCm.current = valor;
            setCm(valor);
            persistir(valor);

            if (valor === META_CM) {
              detener();

              setTimeout(() => {
                if (montado.current) {
                  sincronizar();
                }
              }, 0);
            }
          }
        );

      if (
        !montado.current ||
        version !== generacion.current ||
        !activa.current
      ) {
        suscripcion.remove();
      } else {
        gps.current = suscripcion;
      }
    } catch (error) {
      detener();

      if (montado.current) {
        setMensaje(
          error.message ||
          "No se pudo iniciar el GPS."
        );
      }
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
      }
    }
  }

async function canjear(id) {
  if (!listo) {
    return {
      ok: false,
      mensaje:
        "Todavía estamos preparando tu misión.",
    };
  }

  if (bloqueo.current) {
    return {
      ok: false,
      mensaje:
        "Espera a que termine la operación anterior.",
    };
  }

  if (activa.current) {
    return {
      ok: false,
      mensaje:
        "Pausa la caminata antes de canjear.",
    };
  }

  bloqueo.current = true;
  setOcupado(true);
  setMensaje("");

  try {
    await persistir(refCm.current);

    const sincronizada =
      await sincronizarMision(
        refCm.current,
        uid
      );

    if (montado.current) {
      setNube(sincronizada);

      refCm.current = Math.max(
        refCm.current,
        sincronizada.distanciaCm
      );

      setCm(refCm.current);
    }

    const respuesta =
      await canjearPremio(id, uid);

    const cuenta = respuesta.cuenta;

    if (montado.current) {
      setNube(cuenta);

      refCm.current = Math.max(
        refCm.current,
        cuenta.distanciaCm
      );

      setCm(refCm.current);

      setMensaje(
        respuesta.repetido
          ? "Esta recompensa ya estaba canjeada. Su código está en Mis cupones."
          : "¡Recompensa canjeada! Encontrarás su código en Mis cupones."
      );
    }

    return {
      ok: true,
      codigo: respuesta.codigo,
      repetido: respuesta.repetido,
    };
  } catch (error) {
    console.error(
      "Error al canjear recompensa:",
      error.code || "sin-codigo",
      error.message
    );

    const texto =
      error.code === "permission-denied"
        ? "No se pudo autorizar el canje. Comprueba que las reglas de misión y cupones estén publicadas."
        : error.message ||
          "No se pudo confirmar el canje. Comprueba tu conexión.";

    if (montado.current) {
      setMensaje(texto);
    }

    return {
      ok: false,
      mensaje: texto,
    };
  } finally {
    bloqueo.current = false;

    if (montado.current) {
      setOcupado(false);
    }
  }
}

  function abrirAjustes() {
    Linking.openSettings().catch(() => {
      setMensaje(
        "No se pudieron abrir Ajustes."
      );
    });
  }

  return (
    <Contexto.Provider
      value={{
        nube,
        cm,
        listo,
        cargando,
        ocupado,
        caminando,
        mensaje,
        pasos,
        sensor,
        velocidad,
        precision,
        permiso,

        invitacion:
          listo &&
          !cerrada &&
          cm < META_CM &&
          !nube.metaCompleta,

        cerrarInvitacion: () =>
          setCerrada(true),

        cargar,
        iniciar,
        pausar,
        sincronizar,
        canjear,
        abrirAjustes,
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useCamina() {
  const valor = useContext(Contexto);

  if (!valor) {
    throw new Error(
      "Falta CaminaProvider en MainTabs."
    );
  }

  return valor;
}