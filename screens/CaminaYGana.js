import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Icon,
  ProgressBar,
  Text,
} from "react-native-paper";

import { useIsFocused } from
  "@react-navigation/native";

import { useSafeAreaInsets } from
  "react-native-safe-area-context";

import { useCamina } from
  "../src/context/CaminaContext";

import {
  META_CM,
  PREMIOS,
} from "../src/utils/caminaCore";

import { COLORES as C } from
  "../src/styles/paleta";

function mensajeParaUsuario(mensaje) {
  if (!mensaje) return null;

  if (
    mensaje.startsWith(
      "Progreso confirmado"
    )
  ) {
    return null;
  }

  if (
    mensaje.includes(
      "Progreso local conservado"
    )
  ) {
    return {
      tipo: "aviso",
      texto:
        "Tu avance está guardado en este teléfono. Lo volveremos a enviar al recuperar tu misión.",
    };
  }

  if (
    mensaje.includes(
      "¡Recompensa canjeada!"
    )
  ) {
    return {
      tipo: "exito",
      texto:
        "¡Tu premio está listo! Encuentra su código en Mis cupones.",
    };
  }

  if (
    mensaje.includes(
      "Esta recompensa ya estaba canjeada"
    )
  ) {
    return {
      tipo: "exito",
      texto:
        "Ya tienes esta recompensa. Su código está en Mis cupones.",
    };
  }

  if (
    mensaje.includes(
      "¡Misión completada!"
    )
  ) {
    return {
      tipo: "exito",
      texto:
        "¡Completaste el camino del Sol! Revisa los premios que te faltan.",
    };
  }

  if (
    mensaje.includes(
      "Activa la ubicación desde Ajustes"
    )
  ) {
    return {
      tipo: "aviso",
      texto:
        "Activa el permiso de ubicación en Ajustes para comenzar.",
    };
  }

  if (
    mensaje.includes(
      "Necesitamos ubicación"
    )
  ) {
    return {
      tipo: "aviso",
      texto:
        "Permite el acceso a tu ubicación para medir la caminata.",
    };
  }

  if (
    mensaje.includes(
      "Enciende la ubicación"
    )
  ) {
    return {
      tipo: "aviso",
      texto:
        "Enciende la ubicación del teléfono para iniciar el recorrido.",
    };
  }

  if (
    mensaje.includes(
      "Vuelve a la app"
    )
  ) {
    return {
      tipo: "aviso",
      texto:
        "Pulsa Iniciar cuando estés listo para caminar.",
    };
  }

  if (
    mensaje.includes(
      "suficientes puntos"
    )
  ) {
    return {
      tipo: "aviso",
      texto:
        "Todavía no tienes suficientes puntos disponibles para este premio.",
    };
  }

  if (
    mensaje.includes(
      "La sesión cambió"
    )
  ) {
    return {
      tipo: "error",
      texto:
        "Vuelve a iniciar sesión para continuar.",
    };
  }

  if (
    mensaje.includes(
      "datos inválidos"
    ) ||
    mensaje.includes(
      "no coinciden"
    ) ||
    mensaje.includes(
      "no coincide"
    ) ||
    mensaje.includes(
      "falta su cupón"
    ) ||
    mensaje.includes(
      "no tiene código"
    )
  ) {
    return {
      tipo: "error",
      texto:
        "Encontramos un problema en los datos de tu misión. No pudimos completar la operación.",
    };
  }

  if (
    mensaje.includes(
      "progreso local"
    ) ||
    mensaje.includes(
      "almacenamiento"
    )
  ) {
    return {
      tipo: "error",
      texto:
        "No pudimos guardar o recuperar tu avance en este teléfono. Revisa el almacenamiento antes de continuar.",
    };
  }

  return {
    tipo: "aviso",
    texto:
      "No pudimos completar la operación. Comprueba tu conexión e inténtalo nuevamente.",
  };
}

function AvisoUsuario({ aviso }) {
  if (!aviso) return null;

  const esExito =
    aviso.tipo === "exito";

  const esError =
    aviso.tipo === "error";

  const color = esExito
    ? C.correcto
    : esError
    ? C.error
    : C.doradoClaro;

  return (
    <View
      accessibilityRole="alert"
      style={[
        s.aviso,
        esExito && s.avisoExito,
        esError && s.avisoError,
      ]}
    >
      <Icon
        source={
          esExito
            ? "check-circle-outline"
            : esError
            ? "alert-circle-outline"
            : "information-outline"
        }
        size={23}
        color={color}
      />

      <Text style={s.avisoTexto}>
        {aviso.texto}
      </Text>
    </View>
  );
}

function Metrica({
  icono,
  valor,
  etiqueta,
}) {
  return (
    <View style={s.metrica}>
      <Icon
        source={icono}
        size={23}
        color={C.doradoClaro}
      />

      <Text style={s.numeroMetrica}>
        {valor}
      </Text>

      <Text style={s.etiquetaMetrica}>
        {etiqueta}
      </Text>
    </View>
  );
}

export default function CaminaYGana({
  navigation,
}) {
  const m = useCamina();

  const enfocado = useIsFocused();
  const insets = useSafeAreaInsets();

  const [canjeando, setCanjeando] =
    useState(null);

  const bloqueoCanje = useRef(false);
  const montado = useRef(true);

  const pausaRef = useRef(m.pausar);
  const cargarRef = useRef(m.cargar);
  const estadoRef = useRef(m);

  pausaRef.current = m.pausar;
  cargarRef.current = m.cargar;
  estadoRef.current = m;

  const intentoAutomatico = useRef("");

  useEffect(() => {
    montado.current = true;

    return () => {
      montado.current = false;
    };
  }, []);

  /*
   * Al entrar vuelve a consultar la misión.
   * No hay una consulta por cada coordenada GPS.
   */
  useEffect(() => {
    if (enfocado) {
      const actual = estadoRef.current;

      if (
        !actual.caminando &&
        !actual.ocupado &&
        !actual.cargando
      ) {
        cargarRef.current();
      }
    } else {
      intentoAutomatico.current = "";
      pausaRef.current();
    }

    return () => {
      pausaRef.current();
    };
  }, [enfocado]);

  /*
   * Envía avance local pendiente sin mostrar
   * botones técnicos al usuario.
   */
  useEffect(() => {
    if (
      !enfocado ||
      !m.listo ||
      m.cargando ||
      m.caminando ||
      m.ocupado ||
      canjeando ||
      m.cm <= m.nube.distanciaCm
    ) {
      return;
    }

    const identificador =
      `${m.cm}-${m.nube.distanciaCm}`;

    if (
      intentoAutomatico.current ===
      identificador
    ) {
      return;
    }

    intentoAutomatico.current =
      identificador;

    m.sincronizar();
  }, [
    enfocado,
    m.listo,
    m.cargando,
    m.caminando,
    m.ocupado,
    m.cm,
    m.nube.distanciaCm,
    canjeando,
    m.sincronizar,
  ]);

  const completa =
    m.cm >= META_CM;

  const completadaYGuardada =
    completa &&
    m.nube.metaCompleta;

  const metros =
    m.cm / 100;

  const restantes = Math.max(
    0,
    Math.ceil(
      (META_CM - m.cm) / 100
    )
  );

  const porcentaje = Math.min(
    100,
    Math.floor(
      m.cm / META_CM * 100
    )
  );

  const saldoConfirmado =
    Number.isInteger(m.nube.saldo)
      ? m.nube.saldo
      : 0;

  const pendienteDeGuardar =
    m.cm > m.nube.distanciaCm;

  const ambosCanjeados =
    m.nube.canje10 &&
    m.nube.canje25;

  const aviso =
    mensajeParaUsuario(m.mensaje);

  const operacionEnCurso =
    m.ocupado ||
    m.cargando ||
    !!canjeando;

  async function ejecutarCanje(premio) {
    if (bloqueoCanje.current) return;

    bloqueoCanje.current = true;
    setCanjeando(premio.id);

    try {
      const respuesta =
        await m.canjear(premio.id);

      if (!montado.current) return;

      if (!respuesta?.ok) {
        Alert.alert(
          "No se completó el canje",
          respuesta?.mensaje ||
            "Inténtalo nuevamente."
        );

        return;
      }

      Alert.alert(
        respuesta.repetido
          ? "Ya tienes este premio"
          : "¡Premio conseguido!",
        respuesta.repetido
          ? "Encontramos el cupón de tu canje anterior."
          : "Tu cupón se guardó en tu cuenta y está listo para usar.",
        [
          {
            text: "Seguir aquí",
            style: "cancel",
          },
          {
            text: "Ver mis cupones",
            onPress: () =>
              navigation.navigate(
                "MisCupones"
              ),
          },
        ]
      );
    } catch (error) {
      console.error(
        "Error en pantalla de canje:",
        error.code || "sin-codigo",
        error.message
      );

      if (montado.current) {
        Alert.alert(
          "No se completó el canje",
          "Ocurrió un problema inesperado. Comprueba tu conexión e inténtalo nuevamente."
        );
      }
    } finally {
      bloqueoCanje.current = false;

      if (montado.current) {
        setCanjeando(null);
      }
    }
  }

  function confirmarCanje(premio) {
    if (
      bloqueoCanje.current ||
      operacionEnCurso
    ) {
      return;
    }

    if (m.caminando) {
      Alert.alert(
        "Pausa tu caminata",
        "Pausa el recorrido antes de reclamar un premio."
      );

      return;
    }

    Alert.alert(
      premio.nombre,
      `¿Quieres usar ${premio.costo} puntos para obtener un cupón del ${premio.porcentaje}%? Podrás aplicarlo a un boleto.`,
      [
        {
          text: "Ahora no",
          style: "cancel",
        },
        {
          text: "Canjear premio",
          onPress: () =>
            ejecutarCanje(premio),
        },
      ]
    );
  }

  function terminarRecorrido() {
    Alert.alert(
      "Terminar caminata",
      "Conservaremos tu avance. Si todavía no completas la misión, podrás continuar más adelante.",
      [
        {
          text: "Seguir caminando",
          style: "cancel",
        },
        {
          text: "Terminar",
          onPress: m.pausar,
        },
      ]
    );
  }

  let tituloRecorrido =
    "Comienza tu aventura";

  if (m.caminando) {
    tituloRecorrido =
      "¡Sigue avanzando!";
  } else if (completadaYGuardada) {
    tituloRecorrido =
      "Misión completada";
  } else if (completa) {
    tituloRecorrido =
      "¡Meta alcanzada!";
  } else if (m.cm > 0) {
    tituloRecorrido =
      "Tu aventura continúa";
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        s.pagina,
        {
          paddingTop: Math.max(
            insets.top,
            18
          ),
          paddingBottom:
            Math.max(
              insets.bottom,
              18
            ) + 25,
        },
      ]}
    >
      {/* CABECERA */}
      <View style={s.cabecera}>
        <View style={s.flex}>
          <Text style={s.leyenda}>
            EL CAMINO DEL SOL
          </Text>

          <Text style={s.titulo}>
            Camina y gana
          </Text>

          <Text style={s.descripcion}>
            Cada paso acerca tu próximo premio.
          </Text>
        </View>

        <View style={s.medalla}>
          <Icon
            source={
              completa
                ? "trophy"
                : "trophy-outline"
            }
            size={37}
            color={C.doradoClaro}
          />
        </View>
      </View>

      {/* SALDO Y PROGRESO */}
      <View style={s.panelTesoro}>
        <View style={s.fila}>
          <Icon
            source="treasure-chest-outline"
            size={25}
            color={C.doradoClaro}
          />

          <Text style={s.leyenda}>
            TU TESORO
          </Text>

          <View style={s.flex} />

          <View style={s.insignia}>
            <Text style={s.insigniaTexto}>
              {ambosCanjeados
                ? "PREMIOS CANJEADOS"
                : completa
                ? "META ALCANZADA"
                : "MISIÓN ACTIVA"}
            </Text>
          </View>
        </View>

        <View style={s.saldoFila}>
          <Text style={s.saldo}>
            {!m.listo || m.cargando
              ? "—"
              : saldoConfirmado}
          </Text>

          <View style={s.saldoDescripcion}>
            <Text style={s.saldoUnidad}>
              puntos
            </Text>

            <Text style={s.textoSuave}>
              disponibles para canjear
            </Text>
          </View>
        </View>

        <View style={s.estadisticasPuntos}>
          <View style={s.flex}>
            <Text style={s.etiquetaPequena}>
              GANADOS
            </Text>

            <Text style={s.valorPequeno}>
              {m.nube.puntosObtenidos}
            </Text>
          </View>

          <View style={s.divisorPequeno} />

          <View style={s.flex}>
            <Text style={s.etiquetaPequena}>
              CANJEADOS
            </Text>

            <Text style={s.valorPequeno}>
              {m.nube.gastados}
            </Text>
          </View>
        </View>

        <View style={s.separador} />

        <View style={s.filaEntre}>
          <Text style={s.progresoTitulo}>
            {tituloRecorrido}
          </Text>

          <Text style={s.porcentaje}>
            {porcentaje}%
          </Text>
        </View>

        <ProgressBar
          progress={Math.min(
            1,
            m.cm / META_CM
          )}
          color={C.dorado}
          style={s.barra}
        />

        <View style={s.filaEntre}>
          <Text style={s.distancia}>
            {metros.toFixed(1)} m
          </Text>

          <Text style={s.textoSuave}>
            Meta: 325 m
          </Text>
        </View>

        <Text style={s.descripcionProgreso}>
          {completa
            ? ambosCanjeados
              ? "¡Conquistaste los dos premios del camino del Sol!"
              : "¡Llegaste a la meta! Revisa la tienda y reclama los premios que te faltan."
            : `Te faltan ${restantes} metros para completar tu misión.`}
        </Text>

        {pendienteDeGuardar &&
          !m.caminando && (
            <View style={s.guardado}>
              {m.ocupado ? (
                <ActivityIndicator
                  size="small"
                  color={C.doradoClaro}
                />
              ) : (
                <Icon
                  source="cloud-upload-outline"
                  size={18}
                  color={C.advertencia}
                />
              )}

              <Text style={s.guardadoTexto}>
                {m.ocupado
                  ? "Guardando tu avance…"
                  : "Hay avance de este teléfono pendiente de enviar."}
              </Text>
            </View>
          )}
      </View>

      <AvisoUsuario aviso={aviso} />

      {/* PREPARACIÓN INICIAL */}
      {!m.listo && (
        <View style={s.panel}>
          {m.cargando ? (
            <>
              <ActivityIndicator
                color={C.dorado}
              />

              <Text style={s.textoCentrado}>
                Preparando tu aventura…
              </Text>
            </>
          ) : (
            <>
              <Text style={s.textoCentrado}>
                Necesitamos conexión para
                recuperar tu misión y tus premios.
              </Text>

              <Button
                mode="outlined"
                icon="refresh"
                textColor={C.doradoClaro}
                onPress={m.cargar}
              >
                Reintentar
              </Button>
            </>
          )}
        </View>
      )}

      {/* CAMINATA */}
      {m.listo && (
        <View style={s.panel}>
          <View style={s.fila}>
            <View style={s.iconoSeccion}>
              <Icon
                source={
                  completa
                    ? "flag-checkered"
                    : m.caminando
                    ? "walk"
                    : "map-marker-path"
                }
                size={26}
                color={C.doradoClaro}
              />
            </View>

            <View style={s.flex}>
              <Text style={s.subtitulo}>
                {completa
                  ? "El camino está completo"
                  : m.caminando
                  ? "Recorrido en curso"
                  : "Tu caminata"}
              </Text>

              <Text style={s.textoSuave}>
                {completa
                  ? "Ahora disfruta tus recompensas"
                  : m.caminando
                  ? "Mantén la app abierta mientras caminas"
                  : "Tú eliges cuándo continuar"}
              </Text>
            </View>
          </View>

          {!completa && (
            <View style={s.metricas}>
              <Metrica
                icono="shoe-print"
                valor={m.pasos}
                etiqueta="pasos del recorrido"
              />

              <View style={s.divisorMetrica} />

              <Metrica
                icono="speedometer"
                valor={m.velocidad.toFixed(1)}
                etiqueta="km/h"
              />
            </View>
          )}

          {!completa &&
            !m.caminando && (
              <Button
                mode="contained"
                icon="walk"
                loading={
                  m.ocupado &&
                  !canjeando
                }
                disabled={operacionEnCurso}
                buttonColor={C.boton}
                textColor={C.botonTexto}
                contentStyle={
                  s.botonPrincipal
                }
                labelStyle={s.botonTexto}
                style={s.botonRedondo}
                onPress={m.iniciar}
              >
                {m.cm > 0
                  ? "Continuar caminata"
                  : "Iniciar caminata"}
              </Button>
            )}

          {!completa &&
            m.caminando && (
              <>
                <Button
                  mode="contained"
                  icon="pause"
                  disabled={operacionEnCurso}
                  buttonColor={C.boton}
                  textColor={C.botonTexto}
                  contentStyle={
                    s.botonPrincipal
                  }
                  labelStyle={s.botonTexto}
                  style={s.botonRedondo}
                  onPress={m.pausar}
                >
                  Pausar
                </Button>

                <Button
                  icon="flag-checkered"
                  disabled={operacionEnCurso}
                  textColor={C.doradoClaro}
                  onPress={terminarRecorrido}
                >
                  Terminar caminata
                </Button>
              </>
            )}

          {completa && (
            <View style={s.metaCompletada}>
              <Icon
                source="check-decagram"
                size={32}
                color={C.correcto}
              />

              <Text style={s.metaTexto}>
                Ya recorriste el camino completo.
                Canjear puntos no reinicia
                esta misión.
              </Text>
            </View>
          )}

          {m.permiso &&
            !m.permiso.granted &&
            !m.permiso.canAskAgain &&
            !completa && (
              <Button
                icon="cog-outline"
                mode="outlined"
                textColor={C.doradoClaro}
                disabled={operacionEnCurso}
                onPress={m.abrirAjustes}
              >
                Permitir ubicación en Ajustes
              </Button>
            )}

          {!completa && (
            <View style={s.consejo}>
              <Icon
                source="weather-sunny"
                size={20}
                color={C.doradoClaro}
              />

              <Text style={s.consejoTexto}>
                Camina al aire libre para medir
                mejor tu recorrido. Al salir
                de esta pantalla, tu caminata
                se pausará.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* TIENDA */}
      <View style={s.cabeceraTienda}>
        <View style={s.flex}>
          <Text style={s.leyenda}>
            TIENDA DE RECOMPENSAS
          </Text>

          <Text style={s.tituloTienda}>
            Premios del Inca
          </Text>
        </View>

        <Icon
          source="gift-outline"
          size={31}
          color={C.dorado}
        />
      </View>

      <Text style={s.descripcion}>
        Elige tu recompensa y úsala
        en tu próxima entrada al parque.
      </Text>

      {PREMIOS.map((premio) => {
        const canjeado =
          m.nube[premio.campo];

        // El botón utiliza el saldo confirmado.
        const alcanza =
          saldoConfirmado >= premio.costo;

        const faltan = Math.max(
          0,
          premio.costo -
            saldoConfirmado
        );

        const progresoPremio = Math.max(
          0,
          Math.min(
            1,
            saldoConfirmado /
              premio.costo
          )
        );

        const procesandoEstePremio =
          canjeando === premio.id;

        return (
          <View
            key={premio.id}
            style={[
              s.premio,
              canjeado &&
                s.premioCanjeado,
            ]}
          >
            <View style={s.fila}>
              <View style={s.selloDescuento}>
                <Text style={s.descuentoNumero}>
                  {premio.porcentaje}%
                </Text>

                <Text style={s.descuentoEtiqueta}>
                  DESCUENTO
                </Text>
              </View>

              <View style={s.flex}>
                <Text style={s.nombrePremio}>
                  {premio.nombre}
                </Text>

                <View style={s.costoFila}>
                  <Icon
                    source="star-four-points"
                    size={17}
                    color={C.doradoClaro}
                  />

                  <Text style={s.costo}>
                    {premio.costo} puntos
                  </Text>
                </View>

                <Text style={s.textoSuave}>
                  Para un boleto
                </Text>
              </View>

              <Icon
                source={
                  canjeado
                    ? "check-decagram"
                    : alcanza
                    ? "gift-open-outline"
                    : "lock-outline"
                }
                size={27}
                color={
                  canjeado
                    ? C.correcto
                    : C.dorado
                }
              />
            </View>

            {canjeado ? (
              <View style={s.premioReclamado}>
                <Icon
                  source="check-circle-outline"
                  size={20}
                  color={C.correcto}
                />

                <Text
                  style={
                    s.premioReclamadoTexto
                  }
                >
                  Recompensa canjeada
                </Text>
              </View>
            ) : (
              <>
                <ProgressBar
                  progress={progresoPremio}
                  color={C.dorado}
                  style={s.barraPremio}
                />

                <Text style={s.textoSuave}>
                  {procesandoEstePremio
                    ? "Preparando tu recompensa…"
                    : alcanza
                    ? m.caminando
                      ? "Pausa tu caminata para reclamar este premio."
                      : "¡Ya puedes reclamar esta recompensa!"
                    : `Te faltan ${faltan} puntos.`}
                </Text>

                <Button
                  mode="contained"
                  icon="gift-outline"
                  buttonColor={C.boton}
                  textColor={C.botonTexto}
                  contentStyle={
                    s.botonPremio
                  }
                  style={s.botonRedondo}
                  loading={
                    procesandoEstePremio
                  }
                  disabled={
                    !m.listo ||
                    operacionEnCurso ||
                    m.caminando ||
                    !alcanza
                  }
                  onPress={() =>
                    confirmarCanje(premio)
                  }
                >
                  {procesandoEstePremio
                    ? "Canjeando…"
                    : alcanza
                    ? "Canjear premio"
                    : "Sigue caminando"}
                </Button>
              </>
            )}

            <Text style={s.notaPremio}>
              Una recompensa por cuenta.
            </Text>
          </View>
        );
      })}

      {/* CUPONES */}
      <View style={s.panelCupones}>
        <View style={s.fila}>
          <View style={s.iconoSeccion}>
            <Icon
              source="ticket-percent-outline"
              size={28}
              color={C.doradoClaro}
            />
          </View>

          <View style={s.flex}>
            <Text style={s.subtitulo}>
              Tus premios te esperan
            </Text>

            <Text style={s.textoSuave}>
              Consulta tus códigos
              y descuentos.
            </Text>
          </View>
        </View>

        <Button
          mode="outlined"
          icon="ticket-percent-outline"
          textColor={C.doradoClaro}
          contentStyle={s.botonPremio}
          style={s.botonRedondo}
          disabled={!!canjeando}
          onPress={() =>
            navigation.navigate(
              "MisCupones"
            )
          }
        >
          Ver mis cupones
        </Button>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pagina: {
    paddingHorizontal: 18,
    gap: 17,
    backgroundColor: C.fondo,
    flexGrow: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  flex: {
    flex: 1,
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 3,
  },
  leyenda: {
    color: C.doradoClaro,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  titulo: {
    color: C.crema,
    fontSize: 29,
    fontWeight: "bold",
    fontFamily: "serif",
    marginTop: 6,
  },
  descripcion: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 5,
  },
  medalla: {
    width: 69,
    height: 69,
    backgroundColor: "#3B2813",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#80602B",
    justifyContent: "center",
    alignItems: "center",
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  panelTesoro: {
    backgroundColor: "#35230F",
    borderColor: C.dorado,
    borderWidth: 1,
    borderRadius: 24,
    padding: 20,
    gap: 15,
  },
  insignia: {
    backgroundColor: "#493419",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: 145,
  },
  insigniaTexto: {
    color: C.doradoClaro,
    fontSize: 8,
    fontWeight: "bold",
    letterSpacing: 0.6,
    textAlign: "center",
  },
  saldoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingVertical: 4,
  },
  saldo: {
    fontSize: 56,
    lineHeight: 66,
    color: C.doradoClaro,
    fontWeight: "bold",
  },
  saldoDescripcion: {
    flex: 1,
    gap: 3,
  },
  saldoUnidad: {
    color: C.crema,
    fontSize: 20,
    fontWeight: "bold",
  },
  textoSuave: {
    color: C.textoSecundario,
    fontSize: 12,
    lineHeight: 19,
  },
  estadisticasPuntos: {
    flexDirection: "row",
    backgroundColor: "#2A1B0D",
    borderRadius: 14,
    padding: 13,
    gap: 13,
  },
  etiquetaPequena: {
    color: C.textoSecundario,
    fontSize: 9,
    letterSpacing: 1,
    textAlign: "center",
  },
  valorPequeno: {
    color: C.crema,
    fontSize: 21,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  divisorPequeno: {
    width: 1,
    backgroundColor: "#5D421F",
  },
  separador: {
    height: 1,
    backgroundColor: "#6A4C23",
    marginVertical: 2,
  },
  progresoTitulo: {
    color: C.crema,
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
  },
  porcentaje: {
    color: C.doradoClaro,
    fontSize: 15,
    fontWeight: "bold",
  },
  barra: {
    height: 12,
    borderRadius: 8,
    backgroundColor: "#190F06",
  },
  distancia: {
    color: C.crema,
    fontSize: 21,
    fontWeight: "bold",
  },
  descripcionProgreso: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
  },
  guardado: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 4,
  },
  guardadoTexto: {
    flex: 1,
    color: C.textoSecundario,
    fontSize: 11,
    lineHeight: 18,
  },
  aviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#382710",
  },
  avisoExito: {
    backgroundColor: "#243520",
  },
  avisoError: {
    backgroundColor: "#40231C",
  },
  avisoTexto: {
    flex: 1,
    color: C.crema,
    fontSize: 13,
    lineHeight: 21,
  },
  panel: {
    backgroundColor: "#25170B",
    borderColor: "#65471F",
    borderWidth: 1,
    borderRadius: 21,
    padding: 18,
    gap: 16,
  },
  iconoSeccion: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#3B2813",
    alignItems: "center",
    justifyContent: "center",
  },
  subtitulo: {
    color: C.crema,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricas: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#1D1209",
    borderRadius: 17,
    paddingVertical: 19,
    marginVertical: 2,
  },
  metrica: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  numeroMetrica: {
    color: C.crema,
    fontSize: 28,
    fontWeight: "bold",
  },
  etiquetaMetrica: {
    color: C.textoSecundario,
    fontSize: 11,
    textAlign: "center",
  },
  divisorMetrica: {
    width: 1,
    height: 62,
    backgroundColor: "#4B341B",
  },
  botonPrincipal: {
    minHeight: 53,
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: "bold",
  },
  botonRedondo: {
    borderRadius: 14,
  },
  consejo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    paddingTop: 3,
  },
  consejoTexto: {
    flex: 1,
    color: C.textoSecundario,
    fontSize: 12,
    lineHeight: 20,
  },
  metaCompletada: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#243520",
    borderRadius: 15,
    padding: 15,
  },
  metaTexto: {
    flex: 1,
    color: C.correcto,
    fontSize: 13,
    lineHeight: 21,
  },
  cabeceraTienda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  tituloTienda: {
    color: C.crema,
    fontFamily: "serif",
    fontWeight: "bold",
    fontSize: 25,
    marginTop: 6,
  },
  premio: {
    backgroundColor: "#291A0C",
    borderWidth: 1,
    borderColor: "#80602B",
    borderRadius: 21,
    padding: 18,
    gap: 15,
  },
  premioCanjeado: {
    borderColor: "#547144",
    backgroundColor: "#232719",
  },
  selloDescuento: {
    minWidth: 82,
    minHeight: 78,
    borderRadius: 18,
    padding: 11,
    backgroundColor: "#433016",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  descuentoNumero: {
    color: C.doradoClaro,
    fontSize: 31,
    fontWeight: "bold",
  },
  descuentoEtiqueta: {
    color: C.textoSecundario,
    fontSize: 8,
    letterSpacing: 0.8,
    fontWeight: "bold",
  },
  nombrePremio: {
    color: C.crema,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 7,
  },
  costoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  costo: {
    color: C.doradoClaro,
    fontSize: 13,
    fontWeight: "bold",
  },
  barraPremio: {
    height: 7,
    borderRadius: 6,
    backgroundColor: "#160D06",
  },
  botonPremio: {
    minHeight: 47,
  },
  premioReclamado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#2C3A23",
    padding: 12,
    borderRadius: 13,
  },
  premioReclamadoTexto: {
    color: C.correcto,
    fontSize: 13,
    fontWeight: "bold",
    flex: 1,
  },
  notaPremio: {
    color: C.textoSecundario,
    fontSize: 10,
    textAlign: "center",
  },
  panelCupones: {
    backgroundColor: "#25170B",
    borderWidth: 1,
    borderColor: "#65471F",
    borderRadius: 21,
    padding: 18,
    gap: 17,
    marginTop: 3,
  },
  textoCentrado: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
  },
});