// screens/Atracciones.js

import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";
import atracciones from "../src/data/atracciones.json";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const IMAGEN_ATRACCION = require("../assets/medio.png");

const FILTROS = [
  { id: "todas", label: "Todas" },
  { id: "Aventura", label: "Aventura" },
  { id: "Naturaleza", label: "Naturaleza" },
  { id: "Cultura", label: "Cultura" },
  { id: "Familiar", label: "Familia" },
];

export default function Atracciones({ navigation }) {
  const [filtroActivo, setFiltroActivo] = useState("todas");

  const lista = useMemo(() => {
    if (!Array.isArray(atracciones)) return [];
    if (filtroActivo === "todas") return atracciones;

    return atracciones.filter((a) => {
      const cat = (a.categoria || "").toLowerCase();
      const inten = (a.intensidad || "").toLowerCase();
      const filtro = filtroActivo.toLowerCase();

      if (filtro === "familiar") {
        return inten.includes("familiar") || cat.includes("familiar");
      }
      return cat === filtro || inten === filtro;
    });
  }, [filtroActivo]);

  const abrirDetalle = (item) =>
    navigation.navigate("DetalleAtraccion", { atraccion: item });

  const renderItem = ({ item }) => (
    <Card style={styles.card} mode="outlined">
      <Pressable
        onPress={() => abrirDetalle(item)}
        style={styles.cardContenido}
      >
        <View style={styles.cardImagenWrap}>
          <Image source={IMAGEN_ATRACCION} style={styles.cardImagen} />
        </View>

        <View style={styles.cardInfo}>
          <Text style={styles.cardTitulo}>
            {item.nombre || "Atracción"}
          </Text>

          <Text style={styles.cardMeta}>
            {item.descripcionCorta ||
              `${item.categoria || "General"} · ${item.descripcion || ""}`}
          </Text>

          <Text style={styles.cardHorario}>
            {item.horario || "Horario por confirmar"}
          </Text>

          <Button
            mode="contained"
            buttonColor={COLORES.dorado}
            textColor="#1A1208"
            style={styles.cardBoton}
            labelStyle={styles.cardBotonTexto}
            onPress={() => abrirDetalle(item)}
          >
            VER DETALLE
          </Button>
        </View>
      </Pressable>
    </Card>
  );

  return (
    <View style={styles.contenedor}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.tituloHeader}>INKAPARK</Text>
          <Text style={styles.subtituloHeader}>
            AVENTURA, CULTURA Y NATURALEZA
          </Text>
        </View>
      </View>

      {/* TÍTULO */}
      <View style={styles.tituloWrap}>
        <Text style={styles.titulo}>ATRACCIONES</Text>
        <Text style={styles.subtitulo}>
          Encuentra tu próxima aventura dentro de INKAPARK.
        </Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContenido}
        >
          {FILTROS.map((f) => {
            const activo = filtroActivo === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFiltroActivo(f.id)}
                style={[
                  styles.chip,
                  activo ? styles.chipActivo : styles.chipInactivo,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipTexto,
                    activo ? styles.chipTextoActivo : styles.chipTextoInactivo,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* LISTA */}
      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.mensaje}>No hay atracciones en este filtro.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
  },
  logo: { width: 45, height: 45, marginRight: 10 },
  tituloHeader: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 2.5,
  },
  subtituloHeader: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    letterSpacing: 1,
  },

  tituloWrap: { paddingHorizontal: 15, marginTop: 4, marginBottom: 8 },
  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 24,
    letterSpacing: 2,
  },
  subtitulo: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    marginTop: 4,
  },

  // FILTROS — con separación arriba y abajo
  filtrosWrap: {
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 12,   // 👈 separación con la primera card
  },
  filtrosContenido: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  chip: {
    minWidth: 90,
    height: 40,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActivo: {
    backgroundColor: COLORES.dorado,
    borderColor: COLORES.dorado,
  },
  chipInactivo: {
    backgroundColor: "transparent",
    borderColor: COLORES.dorado,
  },
  chipTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
    textAlign: "center",
    includeFontPadding: false,
  },
  chipTextoActivo: { color: "#1A1208" },
  chipTextoInactivo: { color: COLORES.crema },

  // LISTA con padding superior extra
  lista: {
    paddingHorizontal: 15,
    paddingTop: 8,      // 👈 margen interno extra con la primera card
    paddingBottom: 30,
  },

  card: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 16,
    marginBottom: 14,
    overflow: "hidden",
  },
  cardContenido: { flexDirection: "row", padding: 10 },
  cardImagenWrap: {
    width: 110,
    height: 130,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImagen: {
    width: "100%",
    height: "100%",
  },

  cardInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "space-between",
  },
  cardTitulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  cardMeta: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    marginTop: 4,
  },
  cardHorario: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 6,
    letterSpacing: 0.5,
  },
  cardBoton: {
    marginTop: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  cardBotonTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  mensaje: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginVertical: 30,
  },
});