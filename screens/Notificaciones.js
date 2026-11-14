import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Dialog,
  Icon,
  Portal,
  Text,
} from "react-native-paper";

import DateTimePicker from
  "@react-native-community/datetimepicker";

import { useFocusEffect } from
  "@react-navigation/native";

import { useSafeAreaInsets } from
  "react-native-safe-area-context";

import {
  collection,
  getDocsFromServer,
  query,
  where,
} from "firebase/firestore";

import { db } from
  "../src/config/firebase";

import { useAuth } from
  "../src/context/AuthContext";

import { useNotificaciones } from
  "../src/context/NotificacionesContext";

import { obtenerEspectaculos } from
  "../src/services/espectaculosService";

import { hoyPeru } from
  "../src/utils/recordatoriosCore";

import {
  consultarPermisoAvisos,
  solicitarPermisoAvisos,
  obtenerRecordatorios,
  programarRecordatorio,
  cancelarRecordatorio,
  cancelarTodos,
  limpiarHistorial,
  reactivarRecordatorio,
} from "../src/services/notificacionesService";

import { COLORES as C } from
  "../src/styles/paleta";

const TIPOS = [
  {
    id: "visita",
    nombre: "Mi visita",
    icono: "ticket-outline",
  },
  {
    id: "espectaculo",
    nombre: "Espectáculo",
    icono: "music-note-outline",
  },
  {
    id: "agua",
    nombre: "Hidratación",
    icono: "water-outline",
  },
];

const fechaBonita = (fecha) =>
  fecha
    ?.split("-")
    .reverse()
    .join("/") || "";

function momento(instante) {
  return new Intl.DateTimeFormat(
    "es-PE",
    {
      timeZone: "America/Lima",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(new Date(instante));
}

function Campo({
  icono,
  titulo,
  valor,
  onPress,
  disabled,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={s.campo}
    >
      <Icon
        source={icono}
        size={23}
        color={C.dorado}
      />

      <View style={s.flex}>
        <Text style={s.etiqueta}>
          {titulo}
        </Text>

        <Text style={s.valor}>
          {valor}
        </Text>
      </View>

      <Icon
        source="chevron-down"
        size={21}
        color={C.textoSecundario}
      />
    </Pressable>
  );
}

function Opciones({
  valores,
  valor,
  onChange,
  disabled,
}) {
  return (
    <View style={s.opciones}>
      {valores.map((opcion) => (
        <Pressable
          key={opcion.valor}
          disabled={disabled}
          onPress={() =>
            onChange(opcion.valor)
          }
          style={[
            s.opcion,
            valor === opcion.valor &&
              s.opcionActiva,
          ]}
        >
          <Text
            style={[
              s.opcionTexto,
              valor === opcion.valor && {
                color: C.botonTexto,
              },
            ]}
          >
            {opcion.texto}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function Notificaciones({
  navigation,
  route,
}) {
  const { cuenta } = useAuth();
  const uid = cuenta.uid;

  const {
    revision,
    abrirPlan,
  } = useNotificaciones();

  const insets = useSafeAreaInsets();

  const [pestana, setPestana] =
    useState("crear");

  const [tipo, setTipo] =
    useState("visita");

  const [fecha, setFecha] =
    useState(hoyPeru);

  const [hora, setHora] =
    useState("09:00");

  const [fin, setFin] =
    useState("18:00");

  const [antes, setAntes] =
    useState(10);

  const [intervalo, setIntervalo] =
    useState(30);

  const [boletoId, setBoletoId] =
    useState("");

  const [
    espectaculoId,
    setEspectaculoId,
  ] = useState("");

  const [boletos, setBoletos] =
    useState([]);

  const [
    espectaculos,
    setEspectaculos,
  ] = useState([]);

  const [
    errorCatalogo,
    setErrorCatalogo,
  ] = useState("");

  const [datos, setDatos] =
    useState({
      planes: [],
      historial: [],
    });

  const [permiso, setPermiso] =
    useState(null);

  const [cargando, setCargando] =
    useState(true);

  const [ocupado, setOcupado] =
    useState(false);

  const [mensaje, setMensaje] =
    useState("");

  const [selector, setSelector] =
    useState(null);

  const [picker, setPicker] =
    useState(null);

  const [recarga, setRecarga] =
    useState(0);

  const [detalle, setDetalle] =
    useState(null);

  const bloqueo = useRef(false);

  useEffect(() => {
    const id = route.params?.planId;

    const plan = datos.planes.find(
      (item) => item.id === id
    );

    if (id && plan) {
      setDetalle(plan);

      navigation.setParams({
        planId: undefined,
      });
    }
  }, [
    route.params?.planId,
    datos.planes,
    navigation,
  ]);

  useFocusEffect(
    useCallback(() => {
      let vigente = true;

      async function cargar() {
        try {
          const [
            recordatorios,
            permisoActual,
          ] = await Promise.all([
            obtenerRecordatorios(uid),
            consultarPermisoAvisos(),
          ]);

          if (vigente) {
            setDatos(recordatorios);
            setPermiso(permisoActual);
          }
        } catch {
          if (vigente) {
            setMensaje(
              "No pudimos actualizar tus recordatorios. Inténtalo nuevamente."
            );
          }
        } finally {
          if (vigente) {
            setCargando(false);
          }
        }
      }

      cargar();

      const listener =
        AppState.addEventListener(
          "change",
          (estado) => {
            if (estado === "active") {
              cargar();
            }
          }
        );

      return () => {
        vigente = false;
        listener.remove();
      };
    }, [
      uid,
      revision,
      recarga,
    ])
  );

  useFocusEffect(
    useCallback(() => {
      let vigente = true;

      Promise.allSettled([
        getDocsFromServer(
          query(
            collection(
              db,
              "boletos"
            ),
            where(
              "uid",
              "==",
              uid
            )
          )
        ),

        obtenerEspectaculos(),
      ]).then(
        ([
          resultadoBoletos,
          resultadoEspectaculos,
        ]) => {
          if (!vigente) return;

          if (
            resultadoBoletos.status ===
            "fulfilled"
          ) {
            setBoletos(
              resultadoBoletos.value.docs
                .map((documento) => ({
                  ...documento.data(),
                  id: documento.id,
                }))
                .filter(
                  (boleto) =>
                    boleto.estado ===
                      "activa" &&
                    boleto.fecha >=
                      hoyPeru()
                )
            );
          }

          if (
            resultadoEspectaculos.status ===
            "fulfilled"
          ) {
            setEspectaculos(
              resultadoEspectaculos.value
                .filter(
                  (espectaculo) =>
                    Array.isArray(
                      espectaculo.horarios
                    ) &&
                    espectaculo.horarios.length
                )
            );
          }

          setErrorCatalogo(
            resultadoBoletos.status ===
              "rejected" ||
            resultadoEspectaculos.status ===
              "rejected"
              ? "No pudimos actualizar todas las opciones. Comprueba tu conexión."
              : ""
          );
        }
      );

      return () => {
        vigente = false;
      };
    }, [uid, recarga])
  );

  async function ejecutar(accion) {
    if (bloqueo.current) return;

    bloqueo.current = true;
    setOcupado(true);
    setMensaje("");

    try {
      await accion();

      const [
        recordatorios,
        permisoActual,
      ] = await Promise.all([
        obtenerRecordatorios(uid),
        consultarPermisoAvisos(),
      ]);

      setDatos(recordatorios);
      setPermiso(permisoActual);
    } catch (error) {
      Alert.alert(
        "Recordatorios",
        error.code
          ? "No pudimos completar la operación. Comprueba tu conexión y vuelve a intentarlo."
          : error.message ||
            "No se pudo completar la operación."
      );
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  const boleto = boletos.find(
    (item) => item.id === boletoId
  );

  const espectaculo =
    espectaculos.find(
      (item) =>
        item.id === espectaculoId
    );

  const activos =
    datos.planes.filter(
      (plan) =>
        plan.estado === "activo"
    );

  const pausados =
    datos.planes.filter(
      (plan) =>
        plan.estado === "suspendido" &&
        plan.fechas.some(
          (instante) =>
            instante > Date.now()
        )
    );

  function seleccionarFecha(campo) {
    const fechaElegida =
      tipo === "visita" && boleto
        ? boleto.fecha
        : fecha;

    const partesFecha =
      fechaElegida
        .split("-")
        .map(Number);

    const textoHora =
      campo === "fin"
        ? fin
        : hora;

    const partesHora =
      (
        /^([01]\d|2[0-3]):[0-5]\d$/.test(
          textoHora
        )
          ? textoHora
          : "09:00"
      )
        .split(":")
        .map(Number);

    setPicker({
      campo,

      valor: new Date(
        partesFecha[0],
        partesFecha[1] - 1,
        partesFecha[2],
        partesHora[0],
        partesHora[1]
      ),

      modo:
        campo === "fecha"
          ? "date"
          : "time",
    });
  }

  function cambiarPicker(evento, valor) {
    const campo = picker?.campo;

    setPicker(null);

    if (
      evento.type === "dismissed" ||
      !valor
    ) {
      return;
    }

    const dos = (numero) =>
      String(numero).padStart(
        2,
        "0"
      );

    if (campo === "fecha") {
      setFecha(
        `${valor.getFullYear()}-` +
        `${dos(valor.getMonth() + 1)}-` +
        dos(valor.getDate())
      );
    } else {
      const seleccion =
        `${dos(valor.getHours())}:` +
        dos(valor.getMinutes());

      if (campo === "fin") {
        setFin(seleccion);
      } else {
        setHora(seleccion);
      }
    }
  }

  function programar() {
    ejecutar(async () => {
      if (
        tipo === "visita" &&
        !boleto
      ) {
        throw new Error(
          "Selecciona un boleto vigente."
        );
      }

      if (
        tipo === "espectaculo" &&
        (
          !espectaculo ||
          !espectaculo.horarios.includes(
            hora
          )
        )
      ) {
        throw new Error(
          "Selecciona un espectáculo y uno de sus horarios."
        );
      }

      await programarRecordatorio(
        uid,
        {
          tipo,

          fecha:
            tipo === "visita"
              ? boleto.fecha
              : fecha,

          hora,
          fin,
          antes,
          intervalo,
          boletoId,
          espectaculoId,
        }
      );

      setMensaje(
        "Tu recordatorio está listo."
      );

      setPestana("proximos");
    });
  }

  function confirmarCancelar(plan) {
    Alert.alert(
      "Cancelar recordatorio",
      `¿Cancelar los avisos pendientes de “${plan.titulo}”?`,
      [
        {
          text: "Conservar",
          style: "cancel",
        },
        {
          text: "Cancelar avisos",
          style: "destructive",
          onPress: () =>
            ejecutar(() =>
              cancelarRecordatorio(
                uid,
                plan.id
              )
            ),
        },
      ]
    );
  }

  const itemsSelector =
    selector === "boleto"
      ? boletos.map((item) => ({
          id: item.id,

          texto:
            `${
              item.tipo === "menor"
                ? "Menor"
                : "Adulto"
            } · ` +
            `${fechaBonita(item.fecha)} · ` +
            item.id.slice(-6),
        }))
      : selector === "espectaculo"
      ? espectaculos.map(
          (item) => ({
            id: item.id,
            texto: item.nombre,
          })
        )
      : espectaculo?.horarios
          .filter(
            (valor) =>
              /^([01]\d|2[0-3]):[0-5]\d$/.test(
                valor
              )
          )
          .map((valor) => ({
            id: valor,
            texto: valor,
          })) || [];

  return (
    <View style={s.base}>
      <ScrollView
        contentContainerStyle={[
          s.pagina,
          {
            paddingTop: Math.max(
              18,
              insets.top
            ),
            paddingBottom: Math.max(
              25,
              insets.bottom + 20
            ),
          },
        ]}
      >
        <View style={s.fila}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a mi perfil"
            disabled={ocupado}
            style={s.volver}
            onPress={() =>
              navigation.goBack()
            }
          >
            <Icon
              source="arrow-left"
              size={24}
              color={C.crema}
            />
          </Pressable>

          <View style={s.flex}>
            <Text style={s.leyenda}>
              MI AVENTURA INKAPARK
            </Text>

            <Text style={s.titulo}>
              Recordatorios
            </Text>
          </View>

          <Icon
            source="bell-outline"
            size={30}
            color={C.dorado}
          />
        </View>

        <Text style={s.texto}>
          Disfruta tu visita sin perderte
          los momentos que más te importan.
        </Text>

        {/* PERMISO */}
        <View style={s.panel}>
          <View style={s.fila}>
            <View style={s.icono}>
              <Icon
                source={
                  permiso?.granted
                    ? "bell-check-outline"
                    : "bell-off-outline"
                }
                size={25}
                color={
                  permiso?.granted
                    ? C.correcto
                    : C.dorado
                }
              />
            </View>

            <View style={s.flex}>
              <Text style={s.subtitulo}>
                {!permiso
                  ? "Consultando permiso…"
                  : permiso.granted
                  ? "Avisos permitidos"
                  : "Activa tus recordatorios"}
              </Text>

              <Text style={s.pequeno}>
                {permiso?.granted
                  ? "Puedes elegir qué recibir y cuándo."
                  : "Permite las notificaciones para recibir los avisos que programes."}
              </Text>
            </View>
          </View>

          {permiso &&
            !permiso.granted && (
              <Button
                icon={
                  permiso.canAskAgain
                    ? "bell-outline"
                    : "cog-outline"
                }
                textColor={C.doradoClaro}
                disabled={ocupado}
                onPress={() =>
                  ejecutar(async () => {
                    if (
                      permiso.canAskAgain
                    ) {
                      await solicitarPermisoAvisos();
                    } else {
                      await Linking.openSettings();
                    }
                  })
                }
              >
                {permiso.canAskAgain
                  ? "Permitir avisos"
                  : "Abrir Ajustes"}
              </Button>
            )}
        </View>

        {/* PESTAÑAS */}
        <View style={s.pestanas}>
          {[
            {
              id: "crear",
              texto: "Crear",
            },
            {
              id: "proximos",
              texto:
                `Próximos (${activos.length})`,
            },
            {
              id: "historial",
              texto: "Historial",
            },
          ].map((opcion) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{
                selected:
                  pestana === opcion.id,
              }}
              key={opcion.id}
              disabled={ocupado}
              onPress={() =>
                setPestana(opcion.id)
              }
              style={[
                s.pestana,
                pestana === opcion.id &&
                  s.activa,
              ]}
            >
              <Text
                style={[
                  s.pestanaTexto,
                  pestana === opcion.id && {
                    color: C.botonTexto,
                  },
                ]}
              >
                {opcion.texto}
              </Text>
            </Pressable>
          ))}
        </View>

        {!!mensaje && (
          <View
            accessibilityRole="alert"
            style={s.aviso}
          >
            <Icon
              source="information-outline"
              size={21}
              color={C.dorado}
            />

            <Text
              style={[
                s.texto,
                s.flex,
              ]}
            >
              {mensaje}
            </Text>
          </View>
        )}

        {cargando && (
          <ActivityIndicator
            color={C.dorado}
          />
        )}

        {/* CREAR */}
        {pestana === "crear" && (
          <>
            <Text style={s.subtitulo}>
              ¿Qué quieres recordar?
            </Text>

            <View style={s.tipos}>
              {TIPOS.map((opcion) => (
                <Pressable
                  key={opcion.id}
                  disabled={ocupado}
                  onPress={() => {
                    setTipo(opcion.id);
                    setHora("09:00");
                  }}
                  style={[
                    s.tipo,
                    tipo === opcion.id &&
                      s.tipoActivo,
                  ]}
                >
                  <Icon
                    source={opcion.icono}
                    size={29}
                    color={
                      tipo === opcion.id
                        ? C.doradoClaro
                        : C.textoSecundario
                    }
                  />

                  <Text style={s.tipoTexto}>
                    {opcion.nombre}
                  </Text>
                </Pressable>
              ))}
            </View>

            {!!errorCatalogo && (
              <View style={s.panel}>
                <Text style={s.texto}>
                  {errorCatalogo}
                </Text>

                <Button
                  icon="refresh"
                  textColor={C.doradoClaro}
                  disabled={ocupado}
                  onPress={() =>
                    setRecarga(
                      (valor) => valor + 1
                    )
                  }
                >
                  Actualizar opciones
                </Button>
              </View>
            )}

            <View style={s.panel}>
              {tipo === "visita" && (
                <>
                  <Campo
                    icono="ticket-outline"
                    titulo="TU BOLETO"
                    valor={
                      boleto
                        ? `${
                            boleto.tipo === "menor"
                              ? "Menor"
                              : "Adulto"
                          } · ` +
                          `${fechaBonita(boleto.fecha)} · ` +
                          boleto.id.slice(-6)
                        : "Seleccionar boleto"
                    }
                    onPress={() =>
                      setSelector("boleto")
                    }
                    disabled={ocupado}
                  />

                  {!boletos.length && (
                    <Text style={s.pequeno}>
                      No hay boletos vigentes
                      disponibles. Puedes
                      adquirirlos en Entradas.
                    </Text>
                  )}
                </>
              )}

              {tipo === "espectaculo" && (
                <Campo
                  icono="music-note-outline"
                  titulo="ESPECTÁCULO"
                  valor={
                    espectaculo?.nombre ||
                    "Seleccionar espectáculo"
                  }
                  onPress={() =>
                    setSelector("espectaculo")
                  }
                  disabled={ocupado}
                />
              )}

              {tipo === "visita" &&
              boleto ? (
                <View style={s.fechaFija}>
                  <Icon
                    source="calendar-check-outline"
                    size={23}
                    color={C.dorado}
                  />

                  <Text style={s.valor}>
                    Visita:{" "}
                    {fechaBonita(
                      boleto.fecha
                    )}
                  </Text>
                </View>
              ) : (
                tipo !== "visita" && (
                  <Campo
                    icono="calendar-outline"
                    titulo="FECHA"
                    valor={
                      fechaBonita(fecha)
                    }
                    onPress={() =>
                      seleccionarFecha(
                        "fecha"
                      )
                    }
                    disabled={ocupado}
                  />
                )
              )}

              <Campo
                icono="clock-outline"
                titulo={
                  tipo === "agua"
                    ? "PRIMER AVISO"
                    : tipo === "visita"
                    ? "HORA DE TU VISITA"
                    : "HORARIO DEL ESPECTÁCULO"
                }
                valor={
                  tipo === "espectaculo" &&
                  (
                    !espectaculo ||
                    !espectaculo.horarios.includes(
                      hora
                    )
                  )
                    ? "Seleccionar horario"
                    : hora
                }
                onPress={() =>
                  tipo === "espectaculo"
                    ? setSelector("horario")
                    : seleccionarFecha(
                        "hora"
                      )
                }
                disabled={
                  ocupado ||
                  (
                    tipo === "espectaculo" &&
                    !espectaculo
                  )
                }
              />

              {tipo === "agua" ? (
                <>
                  <Campo
                    icono="clock-end"
                    titulo="ÚLTIMA HORA"
                    valor={fin}
                    onPress={() =>
                      seleccionarFecha(
                        "fin"
                      )
                    }
                    disabled={ocupado}
                  />

                  <Text style={s.etiqueta}>
                    RECORDAR CADA
                  </Text>

                  <Opciones
                    valores={
                      [15, 30, 60].map(
                        (valor) => ({
                          valor,
                          texto:
                            `${valor} min`,
                        })
                      )
                    }
                    valor={intervalo}
                    onChange={setIntervalo}
                    disabled={ocupado}
                  />
                </>
              ) : (
                <>
                  <Text style={s.etiqueta}>
                    AVISAR CON ANTICIPACIÓN
                  </Text>

                  <Opciones
                    valores={[
                      {
                        valor: 0,
                        texto: "A esa hora",
                      },
                      {
                        valor: 10,
                        texto: "10 min",
                      },
                      {
                        valor: 30,
                        texto: "30 min",
                      },
                      {
                        valor: 60,
                        texto: "1 hora",
                      },
                    ]}
                    valor={antes}
                    onChange={setAntes}
                    disabled={ocupado}
                  />
                </>
              )}

              <Text style={s.pequeno}>
                Horarios de Perú.
              </Text>

              <Button
                mode="contained"
                icon="bell-plus-outline"
                buttonColor={C.boton}
                textColor={C.botonTexto}
                loading={ocupado}
                disabled={ocupado}
                contentStyle={s.boton}
                style={s.redondo}
                onPress={programar}
              >
                Guardar recordatorio
              </Button>
            </View>
          </>
        )}

        {/* PRÓXIMOS */}
        {pestana === "proximos" && (
          <>
            {!cargando &&
              !activos.length && (
                <View style={s.vacio}>
                  <Icon
                    source="bell-sleep-outline"
                    size={48}
                    color={C.dorado}
                  />

                  <Text style={s.subtitulo}>
                    Todo a tu ritmo
                  </Text>

                  <Text
                    style={s.textoCentrado}
                  >
                    Aún no tienes avisos
                    programados. Elige lo
                    que quieres recordar
                    y nosotros te acompañamos.
                  </Text>

                  <Button
                    textColor={C.doradoClaro}
                    onPress={() =>
                      setPestana("crear")
                    }
                  >
                    Crear recordatorio
                  </Button>
                </View>
              )}

            {activos.map((plan) => (
              <View
                key={plan.id}
                style={s.panel}
              >
                <View style={s.fila}>
                  <View style={s.icono}>
                    <Icon
                      source={
                        TIPOS.find(
                          (opcion) =>
                            opcion.id ===
                            plan.config.tipo
                        )?.icono ||
                        "bell-outline"
                      }
                      size={25}
                      color={C.dorado}
                    />
                  </View>

                  <View style={s.flex}>
                    <Text style={s.subtitulo}>
                      {plan.titulo}
                    </Text>

                    <Text style={s.fecha}>
                      {plan.proxima
                        ? momento(plan.proxima)
                        : "Actualizando horario…"}
                    </Text>
                  </View>
                </View>

                {plan.config.tipo ===
                  "agua" && (
                  <Text style={s.texto}>
                    Cada{" "}
                    {plan.config.intervalo}
                    {" "}minutos hasta las{" "}
                    {plan.config.fin}.
                  </Text>
                )}

                <View style={s.opciones}>
                  <Button
                    icon="open-in-new"
                    textColor={C.doradoClaro}
                    disabled={ocupado}
                    onPress={() =>
                      abrirPlan(plan)
                    }
                  >
                    Ver detalle
                  </Button>

                  <Button
                    icon="bell-cancel-outline"
                    textColor={C.error}
                    disabled={ocupado}
                    onPress={() =>
                      confirmarCancelar(
                        plan
                      )
                    }
                  >
                    Cancelar
                  </Button>
                </View>
              </View>
            ))}

            {!!activos.length && (
              <Button
                icon="bell-off-outline"
                textColor={C.error}
                disabled={ocupado}
                onPress={() =>
                  Alert.alert(
                    "Pausar todos los avisos",
                    "¿Pausar todos tus recordatorios de este teléfono?",
                    [
                      {
                        text: "Conservar",
                        style: "cancel",
                      },
                      {
                        text: "Pausar",
                        onPress: () =>
                          ejecutar(() =>
                            cancelarTodos(
                              uid
                            )
                          ),
                      },
                    ]
                  )
                }
              >
                Pausar todos
              </Button>
            )}

            {!!pausados.length && (
              <Text style={s.subtitulo}>
                Pausados
              </Text>
            )}

            {pausados.map((plan) => (
              <View
                key={plan.id}
                style={s.panel}
              >
                <Text style={s.subtitulo}>
                  {plan.titulo}
                </Text>

                <Text style={s.texto}>
                  Este recordatorio está pausado.
                </Text>

                <Button
                  icon="bell-ring-outline"
                  textColor={C.doradoClaro}
                  disabled={ocupado}
                  onPress={() =>
                    ejecutar(() =>
                      reactivarRecordatorio(
                        uid,
                        plan.id
                      )
                    )
                  }
                >
                  Reactivar
                </Button>
              </View>
            ))}
          </>
        )}

        {/* HISTORIAL */}
        {pestana === "historial" && (
          <>
            {!datos.historial.length && (
              <View style={s.vacio}>
                <Icon
                  source="history"
                  size={46}
                  color={C.dorado}
                />

                <Text style={s.textoCentrado}>
                  Aquí verás la actividad
                  de tus recordatorios.
                </Text>
              </View>
            )}

            {datos.historial.map(
              (evento) => (
                <View
                  key={evento.id}
                  style={s.historia}
                >
                  <View style={s.punto} />

                  <View style={s.flex}>
                    <Text style={s.subtitulo}>
                      {evento.accion}
                    </Text>

                    <Text style={s.texto}>
                      {evento.titulo}
                    </Text>

                    <Text style={s.pequeno}>
                      {momento(
                        evento.fecha
                      )}
                    </Text>
                  </View>
                </View>
              )
            )}

            {!!datos.historial.length && (
              <Button
                icon="delete-outline"
                textColor={C.error}
                disabled={ocupado}
                onPress={() =>
                  Alert.alert(
                    "Limpiar historial",
                    "Se borrará la actividad mostrada. Tus próximos avisos permanecerán programados.",
                    [
                      {
                        text: "Conservar",
                        style: "cancel",
                      },
                      {
                        text: "Limpiar",
                        onPress: () =>
                          ejecutar(() =>
                            limpiarHistorial(
                              uid
                            )
                          ),
                      },
                    ]
                  )
                }
              >
                Limpiar historial
              </Button>
            )}
          </>
        )}
      </ScrollView>

      {picker && (
        <DateTimePicker
          value={picker.valor}
          mode={picker.modo}
          is24Hour
          onChange={cambiarPicker}
        />
      )}

      {/* DETALLE */}
      <Portal>
        <Dialog
          visible={!!detalle}
          onDismiss={() =>
            setDetalle(null)
          }
          style={s.dialogo}
        >
          <Dialog.Title>
            {detalle?.titulo ||
              "Tu recordatorio"}
          </Dialog.Title>

          <Dialog.Content>
            {!!detalle && (
              <View style={{ gap: 12 }}>
                <Text style={s.texto}>
                  Fecha:{" "}
                  {fechaBonita(
                    detalle.config.fecha
                  )}
                </Text>

                <Text style={s.texto}>
                  {detalle.config.tipo ===
                  "agua"
                    ? "Primer aviso"
                    : "Hora elegida"}
                  : {detalle.config.hora}
                </Text>

                {detalle.config.tipo ===
                "agua" ? (
                  <Text style={s.texto}>
                    Cada{" "}
                    {detalle.config.intervalo}
                    {" "}minutos hasta las{" "}
                    {detalle.config.fin}.
                  </Text>
                ) : (
                  <Text style={s.texto}>
                    Anticipación:{" "}
                    {detalle.config.antes === 0
                      ? "a la hora elegida"
                      : `${detalle.config.antes} minutos`}.
                  </Text>
                )}

                <Text style={s.texto}>
                  Horario de Perú.
                </Text>
              </View>
            )}
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setDetalle(null)
              }
            >
              Entendido
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* SELECTOR */}
      <Portal>
        <Dialog
          visible={!!selector}
          onDismiss={() =>
            setSelector(null)
          }
          style={s.dialogo}
        >
          <Dialog.Title>
            {selector === "boleto"
              ? "Elige tu boleto"
              : selector === "espectaculo"
              ? "Elige un espectáculo"
              : "Elige un horario"}
          </Dialog.Title>

          <Dialog.ScrollArea>
            <ScrollView
              style={{ maxHeight: 330 }}
            >
              {!itemsSelector.length && (
                <Text style={s.texto}>
                  No hay opciones disponibles.
                </Text>
              )}

              {itemsSelector.map(
                (opcion) => (
                  <Pressable
                    key={opcion.id}
                    style={s.itemSelector}
                    onPress={() => {
                      if (
                        selector === "boleto"
                      ) {
                        setBoletoId(
                          opcion.id
                        );
                      } else if (
                        selector ===
                        "espectaculo"
                      ) {
                        setEspectaculoId(
                          opcion.id
                        );

                        setHora("");
                      } else {
                        setHora(
                          opcion.id
                        );
                      }

                      setSelector(null);
                    }}
                  >
                    <Text
                      style={[
                        s.valor,
                        s.flex,
                      ]}
                    >
                      {opcion.texto}
                    </Text>

                    <Icon
                      source="chevron-right"
                      size={20}
                      color={C.dorado}
                    />
                  </Pressable>
                )
              )}
            </ScrollView>
          </Dialog.ScrollArea>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setSelector(null)
              }
            >
              Cerrar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: C.fondo,
  },
  pagina: {
    paddingHorizontal: 18,
    gap: 17,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
  },
  flex: { flex: 1 },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  volver: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#382510",
    alignItems: "center",
    justifyContent: "center",
  },
  leyenda: {
    color: C.doradoClaro,
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: "bold",
  },
  titulo: {
    color: C.crema,
    fontSize: 27,
    fontFamily: "serif",
    fontWeight: "bold",
    marginTop: 5,
  },
  texto: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
  },
  pequeno: {
    color: C.textoSecundario,
    fontSize: 11,
    lineHeight: 18,
  },
  subtitulo: {
    color: C.crema,
    fontWeight: "bold",
    fontSize: 16,
    lineHeight: 23,
  },
  panel: {
    backgroundColor: "#25170B",
    borderWidth: 1,
    borderColor: "#65471F",
    borderRadius: 20,
    padding: 17,
    gap: 15,
  },
  icono: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#3A2712",
    alignItems: "center",
    justifyContent: "center",
  },
  pestanas: {
    flexDirection: "row",
    padding: 5,
    gap: 4,
    backgroundColor: "#211309",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#50371D",
  },
  pestana: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
  },
  activa: {
    backgroundColor: C.boton,
  },
  pestanaTexto: {
    color: C.textoSecundario,
    fontWeight: "bold",
    fontSize: 12,
  },
  aviso: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#352610",
    padding: 14,
    borderRadius: 15,
  },
  tipos: {
    flexDirection: "row",
    gap: 8,
  },
  tipo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 5,
    gap: 9,
    borderRadius: 17,
    backgroundColor: "#25170B",
    borderWidth: 1,
    borderColor: "#50371D",
  },
  tipoActivo: {
    borderColor: C.dorado,
    backgroundColor: "#3B2812",
  },
  tipoTexto: {
    color: C.crema,
    fontSize: 11,
    fontWeight: "bold",
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    backgroundColor: "#1C120A",
    borderWidth: 1,
    borderColor: "#50371D",
    borderRadius: 14,
  },
  etiqueta: {
    color: C.textoSecundario,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 5,
  },
  valor: {
    color: C.crema,
    fontSize: 14,
    lineHeight: 22,
  },
  opciones: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  opcion: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#392611",
  },
  opcionActiva: {
    backgroundColor: C.boton,
  },
  opcionTexto: {
    color: C.textoSecundario,
    fontSize: 12,
    fontWeight: "bold",
  },
  fechaFija: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
  },
  boton: {
    minHeight: 51,
  },
  redondo: {
    borderRadius: 14,
  },
  vacio: {
    alignItems: "center",
    padding: 25,
    gap: 15,
  },
  textoCentrado: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 22,
    textAlign: "center",
  },
  fecha: {
    color: C.doradoClaro,
    fontWeight: "bold",
    fontSize: 13,
    marginTop: 4,
  },
  historia: {
    flexDirection: "row",
    gap: 14,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#25170B",
  },
  punto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.dorado,
    marginTop: 7,
  },
  dialogo: {
    backgroundColor: "#25170B",
  },
  itemSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 17,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#50371D",
  },
});