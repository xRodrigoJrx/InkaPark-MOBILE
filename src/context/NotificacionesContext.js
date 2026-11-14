import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  AppState,
} from "react-native";

import * as Notifications from
  "expo-notifications";

import { getIdTokenResult } from
  "firebase/auth";

import {
  doc,
  getDocFromServer,
} from "firebase/firestore";

import { auth, db } from
  "../config/firebase";

import { useAuth } from
  "./AuthContext";

import { navigationRef } from
  "../navigation/navigationRef";

import {
  avisoPropio,
  limpiarAvisosAjenos,
  registrarEvento,
} from "../services/notificacionesService";

import { hoyPeru } from
  "../utils/recordatoriosCore";

const Contexto =
  createContext(null);

export function NotificacionesProvider({
  children,
}) {
  const {
    cuenta,
    usuario,
    cargandoAuth,
    cargandoPerfil,
  } = useAuth();

  const [
    navegacionPreparada,
    setNavegacionPreparada,
  ] = useState(false);

  const [revision, setRevision] =
    useState(0);

  const [turno, setTurno] =
    useState(0);

  const pendientes = useRef([]);
  const procesando = useRef(false);
  const vistos = useRef(new Set());
  const actual = useRef(null);

  actual.current = cuenta?.uid;

  function agregar(
    data,
    notificacion = null
  ) {
    pendientes.current.push({
      data,
      notificacion,
    });

    setTurno(
      (valor) => valor + 1
    );
  }

  useEffect(() => {
    let vigente = true;

    const recibida =
      Notifications
        .addNotificationReceivedListener(
          (notificacion) => {
            if (
              avisoPropio(notificacion) &&
              notificacion.request.content
                .data.uid === actual.current
            ) {
              registrarEvento(
                actual.current,
                "Recibido con la app abierta",
                notificacion
              )
                .then(() => {
                  if (vigente) {
                    setRevision(
                      (valor) => valor + 1
                    );
                  }
                })
                .catch(() => {});
            }
          }
        );

    function recibirRespuesta(respuesta) {
      const notificacion =
        respuesta?.notification;

      if (!avisoPropio(notificacion)) {
        return;
      }

      agregar(
        notificacion.request.content.data,
        notificacion
      );
    }

    const tocada =
      Notifications
        .addNotificationResponseReceivedListener(
          recibirRespuesta
        );

    Notifications
      .getLastNotificationResponseAsync()
      .then((respuesta) => {
        if (
          vigente &&
          respuesta
        ) {
          recibirRespuesta(respuesta);
        }
      })
      .catch(() => {});

    const app =
      AppState.addEventListener(
        "change",
        (estado) => {
          if (estado === "active") {
            setRevision(
              (valor) => valor + 1
            );
          }
        }
      );

    return () => {
      vigente = false;
      recibida.remove();
      tocada.remove();
      app.remove();
    };
  }, []);

  useEffect(() => {
    if (cargandoAuth) return;

    limpiarAvisosAjenos().catch(() => {
      Alert.alert(
        "Recordatorios",
        "No pudimos pausar algunos avisos del dispositivo. Revisa los recordatorios antes de cambiar de cuenta."
      );
    });
  }, [
    cuenta?.uid,
    cargandoAuth,
  ]);

  useEffect(() => {
    if (
      !navegacionPreparada ||
      cargandoAuth ||
      cargandoPerfil ||
      procesando.current ||
      !pendientes.current.length
    ) {
      return;
    }

    const siguiente =
      pendientes.current[0];

    if (!cuenta) return;

    if (
      siguiente.data.uid !==
      cuenta.uid
    ) {
      pendientes.current.shift();

      setTurno(
        (valor) => valor + 1
      );

      return;
    }

    if (
      !usuario ||
      !navigationRef.isReady()
    ) {
      return;
    }

    procesando.current = true;

    async function abrir() {
      const {
        data,
        notificacion,
      } = pendientes.current.shift();

      const identificador =
        notificacion?.request.identifier;

      try {
        if (
          identificador &&
          vistos.current.has(
            identificador
          )
        ) {
          return;
        }

        if (identificador) {
          vistos.current.add(
            identificador
          );
        }

        const token =
          await getIdTokenResult(
            auth.currentUser
          );

        if (token.claims.rol) return;

        let ruta = {
          screen: "Perfil",
          params: {
            screen: "Notificaciones",
            params: {
              planId: data.planId,
            },
          },
        };

        if (
          data.tipo === "visita"
        ) {
          const snapshot =
            await getDocFromServer(
              doc(
                db,
                "boletos",
                data.boletoId
              )
            );

          if (
            !snapshot.exists() ||
            snapshot.data().uid !==
              data.uid ||
            snapshot.data().estado !==
              "activa" ||
            snapshot.data().fecha <
              hoyPeru()
          ) {
            throw new Error(
              "El boleto ya no está vigente. Puedes revisar tus entradas desde la aplicación."
            );
          }

          ruta = {
            screen: "Entradas",
            params: {
              screen: "DetalleEntrada",
              params: {
                boletoId: snapshot.id,
              },
            },
          };
        } else if (
          data.tipo === "espectaculo"
        ) {
          const snapshot =
            await getDocFromServer(
              doc(
                db,
                "espectaculos",
                data.espectaculoId
              )
            );

          if (
            !snapshot.exists() ||
            snapshot.data().activo !== true
          ) {
            throw new Error(
              "Este espectáculo ya no está disponible."
            );
          }

          ruta = {
            screen: "Inicio",
            params: {
              screen: "DetalleEspectaculo",
              params: {
                espectaculo: {
                  ...snapshot.data(),
                  id: snapshot.id,
                },
              },
            },
          };
        }

        if (
          auth.currentUser?.uid !==
          data.uid
        ) {
          return;
        }

        navigationRef.navigate(
          "Main",
          ruta
        );
      } catch (error) {
        if (
          auth.currentUser?.uid ===
          data.uid
        ) {
          navigationRef.navigate(
            "Main",
            {
              screen: "Perfil",
              params: {
                screen: "Notificaciones",
              },
            }
          );

          Alert.alert(
            "Tu recordatorio",
            error.code
              ? "No pudimos abrir el detalle. Comprueba tu conexión."
              : error.message ||
                "No pudimos abrir el detalle."
          );
        }
      } finally {
        if (notificacion) {
          await registrarEvento(
            data.uid,
            "Abierto",
            notificacion
          ).catch(() => {});

          await Notifications
            .clearLastNotificationResponseAsync()
            .catch(() => {});
        }

        procesando.current = false;

        setRevision(
          (valor) => valor + 1
        );

        setTurno(
          (valor) => valor + 1
        );
      }
    }

    abrir();
  }, [
    navegacionPreparada,
    cuenta?.uid,
    usuario,
    cargandoAuth,
    cargandoPerfil,
    turno,
  ]);

  return (
    <Contexto.Provider
      value={{
        revision,

        navegacionLista: () =>
          setNavegacionPreparada(true),

        abrirPlan: (plan) =>
          agregar({
            inkaAviso: true,
            uid: cuenta.uid,
            planId: plan.id,
            ...plan.config,
          }),
      }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useNotificaciones() {
  const valor =
    useContext(Contexto);

  if (!valor) {
    throw new Error(
      "Falta NotificacionesProvider."
    );
  }

  return valor;
}