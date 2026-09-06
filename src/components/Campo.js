import React from "react";

import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  COLORES,
  FUENTES,
} from "../../styles/paleta";

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
      <Text style={styles.label}>
        {titulo}
      </Text>

      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={
          COLORES.placeholder
        }
        value={valor}
        onChangeText={cambiarValor}
        secureTextEntry={esPassword}
        keyboardType={tipoTeclado}
        autoCapitalize="none"
        maxLength={maxLength}
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
    color:
      COLORES.textoSecundario,

    fontFamily:
      FUENTES.principal,

    fontSize: 7.5,

    letterSpacing: 1.3,

    marginBottom: 6,
  },

  input: {
    width: "100%",

    height: 45,

    paddingHorizontal: 13,

    borderWidth: 1.5,

    borderColor:
      COLORES.bordeInput,

    borderRadius: 10,

    backgroundColor:
      COLORES.input,

    color:
      COLORES.crema,

    fontFamily:
      FUENTES.principal,

    fontSize: 10,
  },
});