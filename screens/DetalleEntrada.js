import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Icon,
  Text,
} from "react-native-paper";

import { useSafeAreaInsets } from
  "react-native-safe-area-context";

import {
  doc,
  getDocFromServer,
  onSnapshot,
} from "firebase/firestore";

import QRCode from "react-native-qrcode-svg";
import * as Print from "expo-print";

import { db } from "../src/config/firebase";

import { COLORES, FUENTES } from
  "../src/styles/paleta";

import {
  hoyLima,
  soles,
} from "../src/services/entradasService";

const TIPOS = {
  menor: {
    nombre: "Entrada menor",
    descripcion: "Menos de 18 años",
    icono: "human-child",
  },

  adulto: {
    nombre: "Entrada adulto",
    descripcion: "Desde 18 años",
    icono: "account-outline",
  },
};

function fechaBonita(fecha) {
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    return "Fecha no disponible";
  }

  const [anio, mes, dia] = fecha.split("-");

  return `${dia}/${mes}/${anio}`;
}

function fechaHora(timestamp) {
  if (
    !timestamp ||
    typeof timestamp.toDate !== "function"
  ) {
    return "";
  }

  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(timestamp.toDate());
}

function informacionEstado(boleto) {
  if (boleto.estado === "usada") {
    return {
      nombre: "UTILIZADO",
      icono: "check-all",
      color: COLORES.textoSecundario,
      fondo: "#403322",
      titulo: "Ingreso registrado",
      descripcion:
        "Este boleto ya fue utilizado y no permite otro ingreso.",
    };
  }

  if (
    boleto.estado === "expirada" ||
    (
      boleto.estado === "activa" &&
      boleto.fecha < hoyLima()
    )
  ) {
    return {
      nombre: "EXPIRADO",
      icono: "calendar-remove-outline",
      color: COLORES.error,
      fondo: "#42251E",
      titulo: "La fecha de visita terminó",
      descripcion:
        "Este boleto no permite ingresar en una fecha posterior.",
    };
  }

  if (boleto.estado === "activa") {
    const esHoy = boleto.fecha === hoyLima();

    return {
      nombre: esHoy
        ? "VÁLIDO PARA HOY"
        : "PRÓXIMA VISITA",
      icono: esHoy
        ? "check-decagram-outline"
        : "calendar-clock-outline",
      color: esHoy
        ? COLORES.correcto
        : COLORES.doradoClaro,
      fondo: esHoy
        ? "#253721"
        : "#3A2B13",
      titulo: esHoy
        ? "Prepara tu código para ingresar"
        : "Tu próxima aventura está reservada",
      descripcion: esHoy
        ? "Presenta este QR al personal. El ingreso se confirma mediante validación online."
        : `Podrás utilizarlo el ${fechaBonita(boleto.fecha)}. No permite ingresar antes de esa fecha.`,
    };
  }

  return {
    nombre: "NO DISPONIBLE",
    icono: "alert-circle-outline",
    color: COLORES.error,
    fondo: "#42251E",
    titulo: "Consulta al personal",
    descripcion:
      "El estado de este boleto requiere revisión.",
  };
}

function escaparHtml(valor) {
  return String(valor ?? "").replace(
    /[&<>"']/g,
    (caracter) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[caracter]
  );
}

function DatoVisita({
  icono,
  titulo,
  valor,
  descripcion,
}) {
  return (
    <View style={styles.dato}>
      <View style={styles.datoIcono}>
        <Icon
          source={icono}
          size={24}
          color={COLORES.doradoClaro}
        />
      </View>

      <View style={styles.flex}>
        <Text style={styles.etiqueta}>
          {titulo}
        </Text>

        <Text style={styles.datoValor}>
          {valor}
        </Text>

        {!!descripcion && (
          <Text style={styles.secundario}>
            {descripcion}
          </Text>
        )}
      </View>
    </View>
  );
}

function FilaImporte({
  titulo,
  valor,
  descuento = false,
  principal = false,
}) {
  return (
    <View style={styles.filaImporte}>
      <Text
        style={[
          styles.secundario,
          principal && styles.totalEtiqueta,
        ]}
      >
        {titulo}
      </Text>

      <Text
        style={[
          styles.importe,
          descuento && {
            color: COLORES.correcto,
          },
          principal && styles.totalValor,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

export default function DetalleEntrada({
  route,
  navigation,
}) {
  const boletoId = route.params?.boletoId;
  const insets = useSafeAreaInsets();

  const [boleto, setBoleto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [imprimiendo, setImprimiendo] =
    useState(false);

  const [qrListo, setQrListo] = useState(false);
  const [desdeCache, setDesdeCache] =
    useState(true);

  const [intento, setIntento] = useState(0);

  const qrRef = useRef(null);
  const bloqueoImpresion = useRef(false);

  const guardarReferenciaQr = useCallback(
    (referencia) => {
      qrRef.current = referencia;
      setQrListo(!!referencia);
    },
    []
  );

  useEffect(() => {
    setBoleto(null);
    setCargando(true);
    setErrorCarga("");
    setMensaje("");

    if (
      typeof boletoId !== "string" ||
      !/^[a-zA-Z0-9-]{20,64}$/.test(boletoId)
    ) {
      setErrorCarga(
        "No se recibió un identificador de boleto válido."
      );

      setCargando(false);
      return;
    }

    return onSnapshot(
      doc(db, "boletos", boletoId),
      { includeMetadataChanges: true },
      (snapshot) => {
        setDesdeCache(
          snapshot.metadata.fromCache
        );

        setCargando(false);

        if (!snapshot.exists()) {
          setBoleto(null);

          setErrorCarga(
            snapshot.metadata.fromCache
              ? "No encontramos una copia local. Comprueba tu conexión."
              : "El boleto no está disponible."
          );

          return;
        }

        const datos = snapshot.data();

        const valido =
          ["menor", "adulto"].includes(datos.tipo) &&
          typeof datos.fecha === "string" &&
          /^\d{4}-\d{2}-\d{2}$/.test(datos.fecha) &&
          Number.isInteger(datos.precio) &&
          Number.isInteger(datos.descuento) &&
          Number.isInteger(datos.total) &&
          typeof datos.compraId === "string" &&
          typeof datos.estado === "string";

        if (!valido) {
          setBoleto(null);

          setErrorCarga(
            "El boleto contiene datos que necesitan revisión."
          );

          return;
        }

        setErrorCarga("");

        setBoleto({
          ...datos,
          id: snapshot.id,
        });
      },
      () => {
        setCargando(false);
        setBoleto(null);

        setErrorCarga(
          "No pudimos consultar tu boleto. Comprueba la conexión e inténtalo nuevamente."
        );
      }
    );
  }, [boletoId, intento]);

  function obtenerImagenQr() {
    return new Promise((resolve, reject) => {
      if (!qrRef.current) {
        reject(
          new Error(
            "Espera a que termine de cargar el QR."
          )
        );
        return;
      }

      const temporizador = setTimeout(() => {
        reject(
          new Error(
            "No se pudo preparar la imagen del QR. Inténtalo nuevamente."
          )
        );
      }, 10000);

      try {
        qrRef.current.toDataURL((imagen) => {
          clearTimeout(temporizador);

          if (!imagen) {
            reject(
              new Error(
                "No se pudo generar la imagen del QR."
              )
            );
            return;
          }

          resolve(imagen);
        });
      } catch (error) {
        clearTimeout(temporizador);
        reject(error);
      }
    });
  }

  async function imprimir() {
    if (bloqueoImpresion.current) return;

    bloqueoImpresion.current = true;
    setImprimiendo(true);
    setMensaje("");

    try {
      if (Platform.OS === "web") {
        throw new Error(
          "Utiliza esta opción desde la aplicación Android."
        );
      }

      // Consultar el estado actual antes de imprimir.
      const snapshot = await getDocFromServer(
        doc(db, "boletos", boletoId)
      );

      if (!snapshot.exists()) {
        throw new Error(
          "El boleto ya no está disponible."
        );
      }

      const actualizado = {
        ...snapshot.data(),
        id: snapshot.id,
      };

      const estadoActual =
        informacionEstado(actualizado);

      const imagen = await obtenerImagenQr();

      const tipo = TIPOS[actualizado.tipo];

      const html = `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />

            <style>
              @page {
                margin: 15mm;
              }

              * {
                box-sizing: border-box;
              }

              body {
                margin: 0;
                padding: 18px;
                font-family: Arial, sans-serif;
                color: #271507;
                background: #ffffff;
              }

              .boleto {
                max-width: 520px;
                margin: 0 auto;
                border: 2px solid #B78E2F;
                border-radius: 18px;
                overflow: hidden;
              }

              .cabecera {
                padding: 24px;
                text-align: center;
                background: #211309;
                color: #F7E9CC;
              }

              h1 {
                margin: 0;
                font-size: 28px;
                letter-spacing: 4px;
              }

              .subtitulo {
                margin-top: 8px;
                color: #EAC55E;
                font-size: 11px;
                letter-spacing: 2px;
              }

              .contenido {
                padding: 24px;
              }

              .estado {
                text-align: center;
                padding: 10px;
                margin-bottom: 20px;
                border: 1px solid #B78E2F;
                border-radius: 8px;
                font-weight: bold;
              }

              .fila {
                margin: 12px 0;
                line-height: 1.5;
              }

              .etiqueta {
                color: #66553B;
                font-size: 12px;
              }

              .valor {
                font-size: 17px;
                font-weight: bold;
              }

              .qr {
                text-align: center;
                margin: 24px 0;
                padding: 18px;
                background: #ffffff;
                border-top: 1px dashed #B78E2F;
                border-bottom: 1px dashed #B78E2F;
              }

              .qr img {
                width: 230px;
                height: 230px;
              }

              .codigo {
                font-family: monospace;
                font-size: 10px;
                overflow-wrap: anywhere;
                margin-top: 12px;
              }

              .nota {
                font-size: 11px;
                line-height: 1.6;
                color: #66553B;
              }

              .total {
                font-size: 23px;
                font-weight: bold;
                margin: 18px 0;
              }

              .pie {
                padding: 16px 24px;
                background: #F7F1E5;
                font-size: 11px;
                line-height: 1.6;
                text-align: center;
              }
            </style>
          </head>

          <body>
            <article class="boleto">
              <header class="cabecera">
                <h1>INKAPARK</h1>
                <div class="subtitulo">
                  CULTURA · AVENTURA · NATURALEZA
                </div>
              </header>

              <main class="contenido">
                <div class="estado">
                  ${escaparHtml(estadoActual.nombre)}
                </div>

                <div class="fila">
                  <div class="etiqueta">
                    FECHA DE VISITA
                  </div>
                  <div class="valor">
                    ${escaparHtml(
                      fechaBonita(actualizado.fecha)
                    )}
                  </div>
                </div>

                <div class="fila">
                  <div class="etiqueta">
                    CATEGORÍA
                  </div>
                  <div class="valor">
                    ${escaparHtml(
                      tipo?.nombre || actualizado.tipo
                    )}
                  </div>
                </div>

                <div class="qr">
                  <img
                    src="data:image/png;base64,${imagen}"
                    alt="Código QR del boleto"
                  />

                  <div class="codigo">
                    ${escaparHtml(actualizado.id)}
                  </div>
                </div>

                <div class="fila">
                  Precio:
                  ${soles(actualizado.precio)}
                </div>

                <div class="fila">
                  Descuento:
                  −${soles(actualizado.descuento)}
                </div>

                <div class="total">
                  Total:
                  ${soles(actualizado.total)}
                </div>

                <div class="nota">
                  IGV incluido.
                  Compra demostrativa sin cobro real.
                </div>

                <div class="codigo">
                  Compra:
                  ${escaparHtml(actualizado.compraId)}
                </div>
              </main>

              <footer class="pie">
                Un boleto permite una sola admisión
                en la fecha indicada.
                La validez se comprueba online.
                Las copias conservan el mismo identificador.
              </footer>
            </article>
          </body>
        </html>
      `;

      await Print.printAsync({ html });
    } catch (error) {
      setMensaje(
        error.message ||
        "No se pudo abrir la impresión."
      );
    } finally {
      bloqueoImpresion.current = false;
      setImprimiendo(false);
    }
  }

  const tipo = boleto
    ? TIPOS[boleto.tipo]
    : null;

  const estado = boleto
    ? informacionEstado(boleto)
    : null;

  const fechaUso = boleto
    ? fechaHora(boleto.usedAt)
    : "";

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          {
            paddingTop: Math.max(
              insets.top,
              16
            ),
            paddingBottom: Math.max(
              insets.bottom,
              18
            ) + 20,
          },
        ]}
      >
        <View style={styles.barraSuperior}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver a mis boletos"
            disabled={imprimiendo}
            onPress={() => navigation.goBack()}
            style={styles.botonVolver}
          >
            <Icon
              source="arrow-left"
              size={24}
              color={COLORES.crema}
            />
          </Pressable>

          <View style={styles.flex}>
            <Text style={styles.tituloBarra}>
              Mi boleto
            </Text>

            <Text style={styles.secundario}>
              Tu acceso a la experiencia InkaPark
            </Text>
          </View>

          <Icon
            source="ticket-confirmation-outline"
            size={28}
            color={COLORES.dorado}
          />
        </View>

        {cargando && (
          <View style={styles.estadoCarga}>
            <ActivityIndicator
              size="large"
              color={COLORES.dorado}
            />

            <Text style={styles.textoCentrado}>
              Preparando tu boleto…
            </Text>
          </View>
        )}

        {!!errorCarga && (
          <View style={styles.panelError}>
            <Icon
              source="ticket-outline"
              size={44}
              color={COLORES.error}
            />

            <Text style={styles.textoCentrado}>
              {errorCarga}
            </Text>

            <Button
              icon="refresh"
              textColor={COLORES.doradoClaro}
              onPress={() =>
                setIntento((valor) => valor + 1)
              }
            >
              Reintentar
            </Button>
          </View>
        )}

        {!!boleto && (
          <>
            {desdeCache && (
              <View style={styles.aviso}>
                <Icon
                  source="cloud-off-outline"
                  size={21}
                  color={COLORES.advertencia}
                />

                <Text style={styles.avisoTexto}>
                  Mostrando una copia guardada.
                  El estado se actualizará al
                  recuperar la conexión.
                </Text>
              </View>
            )}

            <View style={styles.boletoExterior}>
              <View style={styles.cabeceraBoleto}>
                <Image
                  source={require("../assets/logo.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.marca}>
                  INKAPARK
                </Text>

                <Text style={styles.lema}>
                  CULTURA · AVENTURA · NATURALEZA
                </Text>

                <View
                  style={[
                    styles.insignia,
                    {
                      backgroundColor: estado.fondo,
                    },
                  ]}
                >
                  <Icon
                    source={estado.icono}
                    size={18}
                    color={estado.color}
                  />

                  <Text
                    style={[
                      styles.insigniaTexto,
                      { color: estado.color },
                    ]}
                  >
                    {estado.nombre}
                  </Text>
                </View>
              </View>

              <View style={styles.datosVisita}>
                <DatoVisita
                  icono="calendar-month-outline"
                  titulo="FECHA DE VISITA"
                  valor={fechaBonita(boleto.fecha)}
                  descripcion="Horario y condiciones del parque"
                />

                <View style={styles.lineaSuave} />

                <DatoVisita
                  icono={tipo.icono}
                  titulo="CATEGORÍA"
                  valor={tipo.nombre}
                  descripcion={tipo.descripcion}
                />
              </View>

              <View style={styles.corteBoleto}>
                <View style={styles.muescaIzquierda} />
                <View style={styles.lineaPunteada} />
                <View style={styles.muescaDerecha} />
              </View>

              <View style={styles.zonaQr}>
                <Text style={styles.tituloQr}>
                  TU CÓDIGO DE ACCESO
                </Text>

                <Text style={styles.descripcionQr}>
                  Muestra el código completo al personal.
                  Evita recortarlo o cubrir sus bordes.
                </Text>

                <View
                  accessible
                  accessibilityLabel="Código QR único de este boleto"
                  style={styles.marcoQr}
                >
                  <View style={styles.qrBlanco}>
                    <QRCode
                      value={`INKAPARK:1:${boleto.id}`}
                      size={210}
                      quietZone={22}
                      color="#000000"
                      backgroundColor="#FFFFFF"
                      getRef={guardarReferenciaQr}
                    />
                  </View>
                </View>

                <View style={styles.identificador}>
                  <Icon
                    source="identifier"
                    size={19}
                    color={COLORES.dorado}
                  />

                  <Text style={styles.etiqueta}>
                    IDENTIFICADOR DEL BOLETO
                  </Text>
                </View>

                <Text
                  selectable
                  style={styles.codigoBoleto}
                >
                  {boleto.id}
                </Text>

                <View
                  style={[
                    styles.estadoDetalle,
                    {
                      borderColor: estado.color,
                    },
                  ]}
                >
                  <Icon
                    source={estado.icono}
                    size={24}
                    color={estado.color}
                  />

                  <View style={styles.flex}>
                    <Text
                      style={[
                        styles.estadoTitulo,
                        { color: estado.color },
                      ]}
                    >
                      {estado.titulo}
                    </Text>

                    <Text style={styles.secundario}>
                      {estado.descripcion}
                    </Text>

                    {!!fechaUso && (
                      <Text style={styles.fechaUso}>
                        Ingreso registrado: {fechaUso}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.corteBoleto}>
                <View style={styles.muescaIzquierda} />
                <View style={styles.lineaPunteada} />
                <View style={styles.muescaDerecha} />
              </View>

              <View style={styles.detalleImporte}>
                <View style={styles.encabezadoImporte}>
                  <Icon
                    source="receipt-text-outline"
                    size={23}
                    color={COLORES.dorado}
                  />

                  <Text style={styles.tituloSeccion}>
                    Detalle de la compra
                  </Text>
                </View>

                <FilaImporte
                  titulo="Precio del boleto"
                  valor={soles(boleto.precio)}
                />

                <FilaImporte
                  titulo={
                    boleto.porcentaje
                      ? `Descuento · ${boleto.porcentaje}%`
                      : "Descuento"
                  }
                  valor={`−${soles(boleto.descuento)}`}
                  descuento
                />

                <View style={styles.lineaSuave} />

                <FilaImporte
                  titulo="Total del boleto"
                  valor={soles(boleto.total)}
                  principal
                />

                <Text style={styles.nota}>
                  Precio final con IGV incluido.
                </Text>

                {!!boleto.codigoCupon && (
                  <View style={styles.cupon}>
                    <Icon
                      source="ticket-percent-outline"
                      size={18}
                      color={COLORES.correcto}
                    />

                    <Text style={styles.cuponTexto}>
                      Cupón aplicado:{" "}
                      {boleto.codigoCupon}
                    </Text>
                  </View>
                )}

                <View style={styles.referenciaCompra}>
                  <Text style={styles.etiqueta}>
                    REFERENCIA DE COMPRA
                  </Text>

                  <Text
                    selectable
                    style={styles.codigoCompra}
                  >
                    {boleto.compraId}
                  </Text>
                </View>
              </View>

              <View style={styles.pieBoleto}>
                <Icon
                  source="shield-check-outline"
                  size={19}
                  color={COLORES.dorado}
                />

                <Text style={styles.pieTexto}>
                  Un boleto · una sola admisión
                </Text>
              </View>
            </View>

            {!!mensaje && (
              <View style={styles.avisoError}>
                <Icon
                  source="alert-circle-outline"
                  size={21}
                  color={COLORES.error}
                />

                <Text style={styles.errorTexto}>
                  {mensaje}
                </Text>
              </View>
            )}

            <Button
              mode="contained"
              icon="printer-outline"
              loading={imprimiendo}
              disabled={
                imprimiendo ||
                !qrListo
              }
              onPress={imprimir}
              buttonColor={COLORES.boton}
              textColor={COLORES.botonTexto}
              contentStyle={styles.botonPrincipal}
              labelStyle={styles.botonPrincipalTexto}
              style={styles.botonImprimir}
            >
              {imprimiendo
                ? "Preparando impresión…"
                : "Imprimir boleto"}
            </Button>

            <Text style={styles.notaCentrada}>
              Se abrirán las opciones de impresión
              del teléfono. Se necesita conexión
              para consultar el estado actualizado.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  contenido: {
    paddingHorizontal: 18,
    gap: 17,
    width: "100%",
    maxWidth: 620,
    alignSelf: "center",
  },

  flex: {
    flex: 1,
  },

  barraSuperior: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },

  botonVolver: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#30200F",
    alignItems: "center",
    justifyContent: "center",
  },

  tituloBarra: {
    color: COLORES.crema,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 3,
  },

  secundario: {
    color: COLORES.textoSecundario,
    fontSize: 13,
    lineHeight: 20,
  },

  estadoCarga: {
    alignItems: "center",
    paddingVertical: 65,
    gap: 20,
  },

  panelError: {
    padding: 26,
    borderRadius: 20,
    backgroundColor: "#29190F",
    alignItems: "center",
    gap: 16,
  },

  textoCentrado: {
    color: COLORES.textoSecundario,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },

  boletoExterior: {
    backgroundColor: "#24160B",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#80602B",
    overflow: "hidden",
  },

  cabeceraBoleto: {
    alignItems: "center",
    paddingTop: 25,
    paddingBottom: 23,
    paddingHorizontal: 20,
    backgroundColor: "#2D1B0C",
  },

  logo: {
    width: 115,
    height: 66,
    marginBottom: 8,
  },

  marca: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 4,
  },

  lema: {
    color: COLORES.doradoClaro,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 8,
    textAlign: "center",
  },

  insignia: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 20,
    paddingVertical: 9,
    paddingHorizontal: 15,
    marginTop: 20,
  },

  insigniaTexto: {
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  datosVisita: {
    padding: 21,
    gap: 17,
  },

  dato: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  datoIcono: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#3A2712",
    alignItems: "center",
    justifyContent: "center",
  },

  etiqueta: {
    color: COLORES.textoSecundario,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "bold",
  },

  datoValor: {
    color: COLORES.crema,
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 2,
  },

  lineaSuave: {
    height: 1,
    backgroundColor: "#4B341C",
    marginVertical: 3,
  },

  corteBoleto: {
    height: 24,
    justifyContent: "center",
    position: "relative",
  },

  lineaPunteada: {
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#80602B",
    borderStyle: "dashed",
  },

  muescaIzquierda: {
    position: "absolute",
    left: -13,
    top: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.fondo,
    zIndex: 1,
  },

  muescaDerecha: {
    position: "absolute",
    right: -13,
    top: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORES.fondo,
    zIndex: 1,
  },

  zonaQr: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 21,
    alignItems: "center",
    gap: 14,
  },

  tituloQr: {
    color: COLORES.doradoClaro,
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.6,
    textAlign: "center",
  },

  descripcionQr: {
    color: COLORES.textoSecundario,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 310,
  },

  marcoQr: {
    padding: 7,
    borderRadius: 19,
    backgroundColor: "#D9AD38",
    marginVertical: 5,
  },

  qrBlanco: {
    backgroundColor: "#FFFFFF",
    padding: 2,
    borderRadius: 13,
    overflow: "hidden",
  },

  identificador: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 6,
  },

  codigoBoleto: {
    color: COLORES.crema,
    fontFamily:
      Platform.OS === "ios"
        ? "Menlo"
        : "monospace",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    paddingHorizontal: 8,
  },

  estadoDetalle: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 11,
    padding: 14,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: "#1C120A",
    marginTop: 5,
  },

  estadoTitulo: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "bold",
    marginBottom: 4,
  },

  fechaUso: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    marginTop: 8,
    lineHeight: 19,
  },

  detalleImporte: {
    padding: 21,
    gap: 8,
  },

  encabezadoImporte: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 9,
  },

  tituloSeccion: {
    color: COLORES.crema,
    fontSize: 17,
    fontWeight: "bold",
  },

  filaImporte: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },

  importe: {
    color: COLORES.crema,
    fontSize: 15,
    fontWeight: "bold",
  },

  totalEtiqueta: {
    color: COLORES.crema,
    fontSize: 16,
    fontWeight: "bold",
  },

  totalValor: {
    color: COLORES.doradoClaro,
    fontSize: 25,
    fontWeight: "bold",
  },

  nota: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    lineHeight: 18,
  },

  cupon: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 5,
  },

  cuponTexto: {
    color: COLORES.correcto,
    fontSize: 12,
  },

  referenciaCompra: {
    paddingTop: 16,
    marginTop: 9,
    borderTopWidth: 1,
    borderTopColor: "#4B341C",
    gap: 7,
  },

  codigoCompra: {
    color: COLORES.textoSecundario,
    fontSize: 11,
    lineHeight: 18,
  },

  pieBoleto: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#30200F",
    padding: 16,
  },

  pieTexto: {
    color: COLORES.doradoClaro,
    fontSize: 12,
    fontWeight: "bold",
  },

  aviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#302210",
    padding: 14,
    borderRadius: 15,
  },

  avisoTexto: {
    flex: 1,
    color: COLORES.textoSecundario,
    fontSize: 12,
    lineHeight: 20,
  },

  avisoError: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#3B211B",
    padding: 14,
    borderRadius: 15,
  },

  errorTexto: {
    flex: 1,
    color: COLORES.error,
    fontSize: 13,
    lineHeight: 20,
  },

  botonImprimir: {
    borderRadius: 15,
  },

  botonPrincipal: {
    minHeight: 54,
  },

  botonPrincipalTexto: {
    fontSize: 15,
    fontWeight: "bold",
  },

  notaCentrada: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    paddingHorizontal: 10,
  },
});