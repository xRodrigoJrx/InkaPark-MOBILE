import React from "react";

import { StyleSheet, View } from "react-native";

import { Text, HelperText, ProgressBar } from "react-native-paper";

import { COLORES, FUENTES } from "../styles/paleta";

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
    <HelperText
      type={correcto ? "info" : "error"}
      visible={true}
      style={styles.mensaje}
    >
      {correcto ? textoCorrecto : textoError}
    </HelperText>
  );
}

export function NivelContrasena({ nivel }) {
  if (nivel === 0) {
    return null;
  }

  let texto = "";

  let color = COLORES.error;

  let progreso = 0;

  switch (nivel) {
    case 1:
      texto = "Contraseña débil";

      color = COLORES.error;

      progreso = 0.25;

      break;

    case 2:
      texto = "Contraseña regular";

      color = COLORES.advertencia;

      progreso = 0.5;

      break;

    case 3:
      texto = "Contraseña buena";

      color = COLORES.doradoClaro;

      progreso = 0.75;

      break;

    case 4:
      texto = "Contraseña segura";

      color = COLORES.correcto;

      progreso = 1;

      break;
  }

  return (
    <View style={styles.nivel}>
      <ProgressBar progress={progreso} color={color} style={styles.progreso} />

      <Text
        style={[
          styles.textoNivel,

          {
            color: color,
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
    fontFamily: FUENTES.principal,

    fontSize: 8,

    marginTop: -7,

    marginBottom: 9,
  },

  nivel: {
    width: "100%",

    marginTop: -7,

    marginBottom: 10,
  },

  progreso: {
    height: 5,

    borderRadius: 10,

    backgroundColor: "rgba(255,255,255,0.12)",
  },

  textoNivel: {
    fontFamily: FUENTES.principal,

    fontSize: 7,

    marginTop: 5,
  },
});
