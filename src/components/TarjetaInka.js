import React from "react";

import { StyleSheet } from "react-native";

import { Card, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../styles/paleta";

export default function TarjetaInka({
  nombre,

  descripcion,

  imagen,
}) {
  return (
    <Card style={styles.card} mode="outlined">
      <Card.Cover
        source={imagen ? imagen : require("../../assets/inicio.png")}
        style={styles.imagen}
      />

      <Card.Content>
        <Text variant="titleMedium" style={styles.nombre}>
          {nombre}
        </Text>

        <Text variant="bodySmall" style={styles.descripcion}>
          {descripcion}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,

    marginHorizontal: 5,

    backgroundColor: COLORES.tarjeta,

    borderColor: COLORES.bordeTarjeta,

    borderRadius: 15,

    overflow: "hidden",

    elevation: 4,
  },

  imagen: {
    height: 100,

    backgroundColor: COLORES.input,
  },

  nombre: {
    color: COLORES.crema,

    fontFamily: FUENTES.principal,

    fontWeight: "bold",

    fontSize: 12,

    marginTop: 8,
  },

  descripcion: {
    color: COLORES.textoSecundario,

    fontFamily: FUENTES.principal,

    fontSize: 9,

    marginTop: 5,
  },
});
