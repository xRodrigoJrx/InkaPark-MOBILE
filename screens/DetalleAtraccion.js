// screens/DetalleAtraccion.js

import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const IMAGEN_ATRACCION = require("../assets/medio.png");

export default function DetalleAtraccion({ route, navigation }) {
  const { atraccion } = route.params || {};

  if (!atraccion) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.mensaje}>No se encontró la atracción.</Text>
      </View>
    );
  }

  const irAlMapa = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate("Mapa");
    else navigation.navigate("Mapa");
  };

  const recomendaciones = Array.isArray(atraccion.recomendaciones)
    ? atraccion.recomendaciones
    : [
        "Mantén tus pertenencias aseguradas.",
        "Sigue las indicaciones del personal.",
      ];

  return (
    <View style={styles.contenedor}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* 🖼️ HERO */}
        <View style={styles.heroWrap}>
          <Image source={IMAGEN_ATRACCION} style={styles.heroImagen} />

          <LinearGradient
            colors={[
              "rgba(11,11,11,0.05)",
              "rgba(11,11,11,0.35)",
              "rgba(11,11,11,0.85)",
            ]}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </View>

        {/* ⬅️ BOTÓN VOLVER */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.botonVolver}
        >
          <Icon source="chevron-left" size={26} color={COLORES.crema} />
        </Pressable>

        {/* 📋 CARD PRINCIPAL — crece para llenar el espacio restante */}
        <View style={styles.cardPrincipal}>
          <Text style={styles.titulo}>{atraccion.nombre}</Text>

          <Text style={styles.subtitulo}>
            {atraccion.descripcionCorta ||
              `${atraccion.categoria || "General"} · ${
                atraccion.intensidad || "Todo público"
              }`}
          </Text>

          <Text style={styles.descripcion}>
            {atraccion.descripcionLarga ||
              atraccion.descripcion ||
              "Una experiencia única dentro de INKAPARK."}
          </Text>

          <View style={styles.infoRow}>
            <Card style={styles.infoCard} mode="outlined">
              <Card.Content style={styles.infoContenido}>
                <Text style={styles.infoLabel}>DURACIÓN</Text>
                <Text style={styles.infoValor}>
                  {atraccion.duracion || "—"}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.infoCard} mode="outlined">
              <Card.Content style={styles.infoContenido}>
                <Text style={styles.infoLabel}>ALTURA MÍN.</Text>
                <Text style={styles.infoValor}>
                  {atraccion.alturaMin || "—"}
                </Text>
              </Card.Content>
            </Card>

            <Card style={styles.infoCard} mode="outlined">
              <Card.Content style={styles.infoContenido}>
                <Text style={styles.infoLabel}>HORARIO</Text>
                <Text style={styles.infoValor}>
                  {(atraccion.horario || "—").replace(" - ", "–")}
                </Text>
              </Card.Content>
            </Card>
          </View>

          <Text style={styles.tituloSeccion}>RECOMENDACIONES</Text>

          <View style={styles.listaRecomendaciones}>
            {recomendaciones.map((rec, i) => (
              <View key={i} style={styles.itemRecomendacion}>
                <View style={styles.punto} />
                <Text style={styles.textoRecomendacion}>{rec}</Text>
              </View>
            ))}
          </View>

          <Button
            mode="contained"
            buttonColor={COLORES.dorado}
            textColor="#1A1208"
            style={styles.botonMapa}
            labelStyle={styles.botonMapaTexto}
            onPress={irAlMapa}
          >
            VER EN EL MAPA
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.tarjeta,   // mismo color que la card
  },

  mensaje: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginTop: 40,
  },

  // 🔑 CLAVE: flexGrow para que el contenido llene toda la pantalla
  scroll: {
    flexGrow: 1,
    paddingBottom: 0,
  },

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

  // HERO
  heroWrap: {
    width: "100%",
    height: 320,
    backgroundColor: COLORES.fondo,
  },
  heroImagen: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // 🔑 CARD con flex: 1 para ocupar TODO el alto restante
  cardPrincipal: {
    flex: 1,                        // 👈 crece para llenar el hueco
    backgroundColor: COLORES.tarjeta,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    // sin borderWidth → evita cualquier línea visible
  },

  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 24,
    letterSpacing: 1.5,
  },
  subtitulo: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  descripcion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 12,
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 18,
    justifyContent: "space-between",
    gap: 8,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderColor: COLORES.dorado,
    borderRadius: 12,
  },
  infoContenido: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  infoLabel: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  infoValor: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },

  tituloSeccion: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 10,
  },
  listaRecomendaciones: { gap: 8 },
  itemRecomendacion: { flexDirection: "row", alignItems: "center" },
  punto: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORES.dorado,
    marginRight: 10,
  },
  textoRecomendacion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },

  botonMapa: {
    marginTop: 24,
    borderRadius: 24,
    paddingVertical: 4,
  },
  botonMapaTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
});