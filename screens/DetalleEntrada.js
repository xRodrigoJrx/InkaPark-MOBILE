// screens/DetalleEntrada.js

import React, { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

// Genera patrón visual de QR a partir del código
function generarPatronQR(codigo) {
  const tamaño = 15;
  const patron = [];
  let hash = 0;
  for (let i = 0; i < codigo.length; i++) {
    hash = (hash * 31 + codigo.charCodeAt(i)) % 100000;
  }

  for (let y = 0; y < tamaño; y++) {
    const fila = [];
    for (let x = 0; x < tamaño; x++) {
      const enEsquinaTL = x < 3 && y < 3;
      const enEsquinaTR = x >= tamaño - 3 && y < 3;
      const enEsquinaBL = x < 3 && y >= tamaño - 3;

      if (enEsquinaTL || enEsquinaTR || enEsquinaBL) {
        const bordeExterior =
          x === 0 || y === 0 || x === 2 || y === 2 ||
          x === tamaño - 1 || x === tamaño - 3 ||
          y === tamaño - 1 || y === tamaño - 3;
        const centro =
          (x === 1 && y === 1) ||
          (x === tamaño - 2 && y === 1) ||
          (x === 1 && y === tamaño - 2);
        fila.push(bordeExterior || centro);
      } else {
        const valor = (hash + y * 17 + x * 29) % 7;
        fila.push(valor < 3);
      }
    }
    patron.push(fila);
  }
  return patron;
}

export default function DetalleEntrada({ route, navigation }) {
  const { entrada } = route.params || {};
  const [qr, setQr] = useState(null);

  useEffect(() => {
    if (entrada?.codigo) {
      setQr(generarPatronQR(entrada.codigo));
    }
  }, [entrada]);

  if (!entrada) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.mensaje}>No se encontró la entrada.</Text>
      </View>
    );
  }

  const colorEstado =
    entrada.estado === "activa"
      ? "#4CAF50"
      : entrada.estado === "usada"
      ? "#9E9E9E"
      : "#EF5350";

  const textEstado =
    entrada.estado === "activa"
      ? "VÁLIDA PARA INGRESO"
      : entrada.estado === "usada"
      ? "ENTRADA YA UTILIZADA"
      : "ENTRADA EXPIRADA";

  return (
    <View style={styles.contenedor}>
      {/* ⬅️ BOTÓN VOLVER (flotante arriba) */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.botonVolver}
      >
        <Icon source="chevron-left" size={26} color={COLORES.crema} />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.cardPrincipal}>
          {/* 🏷️ Badge con el tipo de entrada */}
          <View style={styles.cabecera}>
            <View style={[styles.tipoBadge, { backgroundColor: entrada.color }]}>
              <Text style={styles.tipoBadgeTexto}>{entrada.tipo}</Text>
            </View>
            <Text style={styles.titulo}>TU ENTRADA</Text>
            <View style={styles.divisor} />
          </View>

          {/* QR */}
          <Card style={styles.qrCard} mode="outlined">
            <Card.Content style={styles.qrContenido}>
              {qr && (
                <View style={styles.qrGrid}>
                  {qr.map((fila, y) => (
                    <View key={y} style={styles.qrFila}>
                      {fila.map((activo, x) => (
                        <View
                          key={x}
                          style={[
                            styles.qrCelda,
                            activo ? styles.qrCeldaOn : styles.qrCeldaOff,
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              )}

              <Text style={styles.qrCodigo}>{entrada.codigo}</Text>

              <View
                style={[
                  styles.estadoIngreso,
                  { backgroundColor: colorEstado + "22", borderColor: colorEstado },
                ]}
              >
                <Icon
                  source={
                    entrada.estado === "activa" ? "check-circle" : "alert-circle"
                  }
                  size={16}
                  color={colorEstado}
                />
                <Text style={[styles.estadoIngresoTexto, { color: colorEstado }]}>
                  {textEstado}
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Text style={styles.tituloSeccion}>DATOS DE LA ENTRADA</Text>

          <View style={styles.infoGrid}>
            <InfoItem icono="account" label="TITULAR" valor={entrada.titular} />
            <InfoItem
              icono="card-account-details"
              label="DOCUMENTO"
              valor={entrada.documento}
            />
            <InfoItem icono="calendar" label="FECHA" valor={entrada.fecha} />
            <InfoItem icono="clock-outline" label="HORA" valor={entrada.hora} />
            <InfoItem icono="map-marker" label="ZONA" valor={entrada.zona} />
            <InfoItem
              icono="account-multiple"
              label="ACOMPAÑANTES"
              valor={String(entrada.acompanantes)}
            />
          </View>

          <View style={styles.precioWrap}>
            <Text style={styles.precioLabel}>PRECIO PAGADO</Text>
            <Text style={styles.precioValor}>{entrada.precio}</Text>
          </View>

          <View style={styles.notaWrap}>
            <Icon source="information-outline" size={16} color={COLORES.dorado} />
            <Text style={styles.notaTexto}>
              Muestra este código QR en la entrada del parque. El personal lo
              escaneará para validar tu acceso.
            </Text>
          </View>

          <Button
            mode="contained"
            buttonColor={COLORES.dorado}
            textColor="#1A1208"
            style={styles.botonMapa}
            labelStyle={styles.botonMapaTexto}
            icon="download"
            onPress={() => {}}
          >
            DESCARGAR PDF
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoItem({ icono, label, valor }) {
  return (
    <View style={styles.infoItem}>
      <Icon source={icono} size={16} color={COLORES.dorado} />
      <View style={styles.infoItemTextos}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValor} numberOfLines={2}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  scroll: {
    paddingBottom: 30,
  },

  mensaje: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginTop: 40,
  },

  // ⬅️ Botón volver flotante
  botonVolver: {
    position: "absolute",
    top: 40,
    left: 15,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },

  // 📋 Card principal
  cardPrincipal: {
    backgroundColor: COLORES.tarjeta,
    paddingHorizontal: 20,
    paddingTop: 60,          // 👈 espacio justo para el botón volver
    paddingBottom: 30,
  },

  // 🏷️ Cabecera con badge
  cabecera: {
    alignItems: "center",
    marginBottom: 24,
  },
  tipoBadge: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 22,
    marginBottom: 18,
    alignSelf: "center",
  },
  tipoBadgeTexto: {
    color: "#FFF",
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 2,
    textAlign: "center",
  },
  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 26,
    letterSpacing: 2,
    textAlign: "center",
  },
  divisor: {
    width: 60,
    height: 2,
    backgroundColor: COLORES.dorado,
    marginTop: 12,
  },

  // QR
  qrCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 0,
    marginTop: 6,
  },
  qrContenido: {
    alignItems: "center",
    padding: 20,
  },
  qrGrid: {
    width: 220,
    height: 220,
    backgroundColor: "#FFF",
    padding: 6,
    borderRadius: 8,
  },
  qrFila: { flexDirection: "row", flex: 1 },
  qrCelda: { flex: 1, margin: 0.5, borderRadius: 1 },
  qrCeldaOn: { backgroundColor: "#1A1208" },
  qrCeldaOff: { backgroundColor: "#FFFFFF" },

  qrCodigo: {
    color: "#1A1208",
    fontFamily: FUENTE_INCA,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 16,
  },
  estadoIngreso: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  estadoIngresoTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.6,
  },

  // Info
  tituloSeccion: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 26,
    marginBottom: 12,
  },
  infoGrid: { gap: 8 },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(217,173,56,0.06)",
    borderLeftWidth: 2,
    borderLeftColor: COLORES.dorado,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 12,
  },
  infoItemTextos: { flex: 1 },
  infoLabel: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },
  infoValor: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 12,
    marginTop: 2,
  },

  // Precio
  precioWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(217,173,56,0.10)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(217,173,56,0.35)",
  },
  precioLabel: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  precioValor: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  // Nota
  notaWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 20,
    backgroundColor: "rgba(217,173,56,0.06)",
    borderLeftWidth: 3,
    borderLeftColor: COLORES.dorado,
    padding: 12,
    borderRadius: 8,
  },
  notaTexto: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    flex: 1,
    lineHeight: 16,
  },

  // Botón
  botonMapa: {
    marginTop: 22,
    borderRadius: 24,
    paddingVertical: 4,
  },
  botonMapaTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
});