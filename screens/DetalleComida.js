// screens/DetalleComida.js

import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Card, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const IMAGEN_COMIDA = require("../assets/Comida.webp");

export default function DetalleComida({ route, navigation }) {
  const { comida } = route.params || {};
  const { height } = useWindowDimensions();

  if (!comida) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.mensaje}>No se encontró el plato.</Text>
      </View>
    );
  }

  const irAlMapa = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate("Mapa");
    else navigation.navigate("Mapa");
  };

  // Altura del hero — solo imagen, sin texto
  const alturaHero = height * 0.45;

  return (
    <View style={styles.contenedor}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* 🖼️ HERO — solo imagen con degradado al fondo */}
        <View style={[styles.heroWrap, { height: alturaHero }]}>
          <Image
            source={IMAGEN_COMIDA}
            style={styles.heroImagen}
            resizeMode="cover"
          />

          <LinearGradient
            colors={[
              "rgba(11,11,11,0.15)",
              "rgba(11,11,11,0.55)",
              "rgba(11,11,11,0.98)",
            ]}
            locations={[0, 0.6, 1]}
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

        {/* 📋 CARD PRINCIPAL — TODO el texto va aquí dentro */}
        <View style={styles.cardPrincipal}>
          {/* Cabecera dentro de la card */}
          <View style={styles.cabeceraCard}>
            <View style={styles.categoriaBadge}>
              <Text style={styles.categoriaTexto}>{comida.categoria}</Text>
            </View>

            <Text style={styles.tituloGrande}>{comida.nombre}</Text>

            {/* Precio grande */}
            <View style={styles.precioWrap}>
              <Text style={styles.precioTexto}>{comida.precio}</Text>
            </View>

            {/* Etiquetas */}
            <View style={styles.etiquetasWrap}>
              {comida.picante && (
                <View style={styles.etiquetaPicante}>
                  <Icon source="fire" size={12} color="#FFF" />
                  <Text style={styles.etiquetaTexto}>Picante</Text>
                </View>
              )}
              {comida.vegetariano && (
                <View style={styles.etiquetaVeg}>
                  <Icon source="leaf" size={12} color="#FFF" />
                  <Text style={styles.etiquetaTexto}>Vegetariano</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.descripcion}>
            {comida.descripcionLarga || comida.descripcion}
          </Text>

          {/* Datos: porción, tiempo */}
          <View style={styles.infoRow}>
            <Card style={styles.infoCard} mode="outlined">
              <Card.Content style={styles.infoContenido}>
                <Icon
                  source="account-multiple"
                  size={18}
                  color={COLORES.dorado}
                />
                <Text style={styles.infoLabel}>PORCIÓN</Text>
                <Text style={styles.infoValor}>{comida.porcion}</Text>
              </Card.Content>
            </Card>

            <Card style={styles.infoCard} mode="outlined">
              <Card.Content style={styles.infoContenido}>
                <Icon source="clock-fast" size={18} color={COLORES.dorado} />
                <Text style={styles.infoLabel}>PREPARACIÓN</Text>
                <Text style={styles.infoValor}>{comida.tiempoPrep}</Text>
              </Card.Content>
            </Card>
          </View>

          {/* Nota comercial */}
          <View style={styles.notaWrap}>
            <Icon
              source="information-outline"
              size={14}
              color={COLORES.dorado}
            />
            <Text style={styles.notaTexto}>
              Pide directamente en el puesto y recibe tu pedido en minutos.
            </Text>
          </View>

          <Button
            mode="contained"
            buttonColor={COLORES.dorado}
            textColor="#1A1208"
            style={styles.botonMapa}
            labelStyle={styles.botonMapaTexto}
            onPress={irAlMapa}
          >
            VER PUESTO EN EL MAPA
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.tarjeta,
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  mensaje: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginTop: 40,
  },

  // 🖼️ HERO — solo imagen
  heroWrap: {
    width: "100%",
    position: "relative",
    backgroundColor: COLORES.fondo,
  },
  heroImagen: {
    width: "100%",
    height: "100%",
  },

  // ⬅️ Botón volver
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

  // 📋 CARD
  cardPrincipal: {
    flex: 1,
    backgroundColor: COLORES.tarjeta,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: COLORES.bordeTarjeta,
  },

  // 🏷️ Cabecera DENTRO de la card
  cabeceraCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  categoriaBadge: {
    backgroundColor: "rgba(217,173,56,0.15)",
    borderWidth: 1,
    borderColor: COLORES.dorado,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    marginBottom: 12,
  },
  categoriaTexto: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.2,
  },
  tituloGrande: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 28,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  precioWrap: {
    marginTop: 14,
    backgroundColor: COLORES.dorado,
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 22,
  },
  precioTexto: {
    color: "#1A1208",
    fontFamily: FUENTE_INCA,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  etiquetasWrap: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  etiquetaPicante: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#B71C1C",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etiquetaVeg: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2E7D32",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  etiquetaTexto: {
    color: "#FFF",
    fontFamily: FUENTES.principal,
    fontSize: 10,
    fontWeight: "bold",
  },

  descripcion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: "transparent",
    borderColor: COLORES.dorado,
    borderRadius: 12,
  },
  infoContenido: {
    alignItems: "center",
    padding: 10,
    gap: 4,
  },
  infoLabel: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.8,
    marginTop: 4,
  },
  infoValor: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },

  notaWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
    backgroundColor: "rgba(217,173,56,0.08)",
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

  botonMapa: {
    marginTop: 24,
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