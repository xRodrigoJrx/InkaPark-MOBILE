import React from "react";

import { StyleSheet, View } from "react-native";

import { Text, TextInput } from "react-native-paper";

import { COLORES, FUENTES } from "../styles/paleta";

export default function Campo({
  titulo,

  placeholder,

  valor,

  cambiarValor,

  esPassword,

  tipoTeclado,

  maxLength,
}) {
  return (
    <View style={styles.campo}>
      <Text style={styles.label}>{titulo}</Text>

      <TextInput
        mode="outlined"
        placeholder={placeholder}
        value={valor}
        onChangeText={cambiarValor}
        secureTextEntry={esPassword}
        keyboardType={tipoTeclado}
        autoCapitalize="none"
        maxLength={maxLength}
        placeholderTextColor={COLORES.placeholder}
        textColor={COLORES.crema}
        outlineColor={COLORES.bordeInput}
        activeOutlineColor={COLORES.dorado}
        style={styles.input}
        theme={{
          colors: {
            background: COLORES.input,
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    width: "100%",

    marginBottom: 13,
  },

  label: {
    color: COLORES.textoSecundario,

    fontFamily: FUENTES.principal,

    fontSize: 7.5,

    letterSpacing: 1.3,

    marginBottom: 6,
  },

  input: {
    width: "100%",

    height: 45,

    backgroundColor: COLORES.input,

    borderRadius: 10,

    fontFamily: FUENTES.principal,

    fontSize: 10,
  },
});
