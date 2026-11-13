// screens/DetalleEspectaculo.js

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
import { Button, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const IMAGEN_ESPECTACULO = require("../assets/Espectaculo.jpg");

export default function DetalleEspectaculo({ route, navigation }) {
  const { espectaculo } = route.params || {};
  const { height } = useWindowDimensions();

  if (!espectaculo) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.mensaje}>No se encontró el espectáculo.</Text>
      </View>
    );
  }

  const irAlMapa = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate("Mapa");
    else navigation.navigate("Mapa");
  };

  // Altura del hero — la imagen sola, sin texto
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
            source={IMAGEN_ESPECTACULO}
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
            <Text style={styles.tipoBadge}>{espectaculo.tipo}</Text>
            <Text style={styles.invitacion}>
              “{espectaculo.invitacion}”
            </Text>
            <Text style={styles.tituloGrande}>{espectaculo.nombre}</Text>
            <View style={styles.divisor} />
          </View>

          <Text style={styles.descripcion}>
            {espectaculo.descripcionLarga || espectaculo.descripcion}
          </Text>

          {/* Datos clave */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Icon source="clock-outline" size={18} color={COLORES.dorado} />
              <Text style={styles.infoLabel}>DURACIÓN</Text>
              <Text style={styles.infoValor}>{espectaculo.duracion}</Text>
            </View>

            <View style={styles.infoItem}>
              <Icon
                source="map-marker-outline"
                size={18}
                color={COLORES.dorado}
              />
              <Text style={styles.infoLabel}>UBICACIÓN</Text>
              <Text style={styles.infoValor}>{espectaculo.ubicacion}</Text>
            </View>
          </View>

          {/* Horarios */}
          <Text style={styles.tituloSeccion}>HORARIOS</Text>

          <View style={styles.horariosWrap}>
            {espectaculo.horarios.map((h, i) => (
              <View key={i} style={styles.horarioItem}>
                <Icon
                  source="ticket-confirmation"
                  size={14}
                  color={COLORES.dorado}
                />
                <Text style={styles.horarioTexto}>{h} hrs</Text>
              </View>
            ))}
          </View>

          {/* Botón */}
          <Button
            mode="contained"
            buttonColor={COLORES.dorado}
            textColor="#1A1208"
            style={styles.botonMapa}
            labelStyle={styles.botonMapaTexto}
            onPress={irAlMapa}
          >
            VER UBICACIÓN EN EL MAPA
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
  tipoBadge: {
    color: "#1A1208",
    backgroundColor: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
  },
  invitacion: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontStyle: "italic",
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  tituloGrande: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 28,
    letterSpacing: 1.5,
    textAlign: "center",
  },
  divisor: {
    width: 60,
    height: 2,
    backgroundColor: COLORES.dorado,
    marginTop: 14,
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
    gap: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(217,173,56,0.4)",
    borderRadius: 12,
    paddingVertical: 12,
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

  tituloSeccion: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 10,
  },

  horariosWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  horarioItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: COLORES.dorado,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "rgba(217,173,56,0.08)",
  },
  horarioTexto: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  botonMapa: {
    marginTop: 26,
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