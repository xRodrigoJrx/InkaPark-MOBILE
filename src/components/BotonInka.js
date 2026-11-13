import React from "react";

import { Button } from "react-native-paper";

import { StyleSheet } from "react-native";

import { COLORES, FUENTES } from "../styles/paleta";

export default function BotonInka({
  children,

  onPress,

  modo = "principal",

  disabled = false,
}) {
  return (
    <Button
      mode={modo === "principal" ? "contained" : "outlined"}
      onPress={onPress}
      disabled={disabled}
      buttonColor={modo === "principal" ? COLORES.boton : "transparent"}
      textColor={
        modo === "principal" ? COLORES.botonTexto : COLORES.doradoClaro
      }
      style={styles.boton}
      labelStyle={styles.texto}
    >
      {children}
    </Button>
  );
}

const styles = StyleSheet.create({
  boton: {
    width: "100%",

    height: 46,

    borderRadius: 10,

    justifyContent: "center",

    marginTop: 10,

    borderColor: COLORES.dorado,
  },

  texto: {
    fontFamily: FUENTES.principal,

    fontWeight: "bold",

    fontSize: 9,

    letterSpacing: 1.3,
  },
});
