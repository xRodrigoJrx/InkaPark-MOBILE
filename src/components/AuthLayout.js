import React from "react";

import {
  Image,
  ImageBackground,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { StatusBar } from "expo-status-bar";

import { COLORES } from "../styles/paleta";

export default function AuthLayout({ children }) {
  const { width } = useWindowDimensions();

  const esTablet = width > 700;

  return (
    <View style={styles.contenedor}>
      <StatusBar style="light" />

      <View style={styles.pantalla}>
        {/* PILAR IZQUIERDO */}

        <View style={[styles.zonaPilar, styles.zonaIzquierda]}>
          <Image
            source={require("../../assets/Pilar1.png")}
            style={[
              styles.pilarIzquierdo,
              {
                width: esTablet ? "190%" : "250%",
              },
            ]}
            resizeMode="stretch"
          />
        </View>

        {/* ZONA CENTRAL */}

        <View style={styles.centro}>
          <ImageBackground
            source={require("../../assets/medio.png")}
            resizeMode="cover"
            style={styles.imagenFondo}
          >
            <View style={styles.capaOscura}>{children}</View>
          </ImageBackground>
        </View>

        {/* PILAR DERECHO */}

        <View style={[styles.zonaPilar, styles.zonaDerecha]}>
          <Image
            source={require("../../assets/Pilar2.png")}
            style={[
              styles.pilarDerecho,
              {
                width: esTablet ? "190%" : "250%",
              },
            ]}
            resizeMode="stretch"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,

    backgroundColor: COLORES.fondo,
  },

  pantalla: {
    flex: 1,

    flexDirection: "row",
  },

  zonaPilar: {
    flex: 1.2,

    overflow: "hidden",

    backgroundColor: COLORES.pilar,

    justifyContent: "center",
  },

  zonaIzquierda: {
    alignItems: "flex-start",
  },

  zonaDerecha: {
    alignItems: "flex-end",
  },

  pilarIzquierdo: {
    flex: 1,

    alignSelf: "flex-start",
  },

  pilarDerecho: {
    flex: 1,

    alignSelf: "flex-end",
  },

  centro: {
    flex: 7.6,

    backgroundColor: COLORES.centro,
  },

  imagenFondo: {
    flex: 1,
  },

  capaOscura: {
    flex: 1,

    backgroundColor: COLORES.capaOscura,

    justifyContent: "center",

    alignItems: "center",

    paddingHorizontal: 5,
  },
});
