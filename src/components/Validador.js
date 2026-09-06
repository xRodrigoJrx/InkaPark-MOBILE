import React from "react";

import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  COLORES,
  FUENTES,
} from "../../styles/paleta";

export function MensajeValidacion({
  mostrar,
  correcto,
  textoCorrecto,
  textoError,
}) {
  if (!mostrar) {
    return null;
  }

  return (
    <Text
      style={[
        styles.mensaje,
        {
          color: correcto
            ? COLORES.correcto
            : COLORES.error,
        },
      ]}
    >
      {correcto
        ? textoCorrecto
        : textoError}
    </Text>
  );
}

export function NivelContrasena({
  nivel,
}) {
  if (nivel === 0) {
    return null;
  }

  let texto = "";
  let color = COLORES.error;
  let ancho = "25%";

  if (nivel === 1) {
    texto = "Contraseña débil";
    color = COLORES.error;
    ancho = "25%";
  }

  if (nivel === 2) {
    texto = "Contraseña regular";
    color = COLORES.advertencia;
    ancho = "50%";
  }

  if (nivel === 3) {
    texto = "Contraseña buena";
    color = COLORES.doradoClaro;
    ancho = "75%";
  }

  if (nivel === 4) {
    texto = "Contraseña segura";
    color = COLORES.correcto;
    ancho = "100%";
  }

  return (
    <View style={styles.nivel}>
      <View style={styles.barraFondo}>
        <View
          style={[
            styles.barra,
            {
              width: ancho,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text
        style={[
          styles.textoNivel,
          {
            color,
          },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mensaje: {
    fontFamily:
      FUENTES.principal,

    fontSize: 7,

    marginTop: -7,

    marginBottom: 9,
  },

  nivel: {
    width: "100%",

    marginTop: -7,

    marginBottom: 10,
  },

  barraFondo: {
    width: "100%",

    height: 4,

    borderRadius: 5,

    backgroundColor:
      "rgba(255,255,255,0.12)",

    overflow: "hidden",
  },

  barra: {
    height: "100%",

    borderRadius: 5,
  },

  textoNivel: {
    fontFamily:
      FUENTES.principal,

    fontSize: 7,

    marginTop: 4,
  },
});