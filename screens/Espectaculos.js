// screens/Espectaculos.js

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
import { Card, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";
import espectaculos from "../src/data/espectaculos.json";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const IMAGEN_ESPECTACULO = require("../assets/Espectaculo.jpg");

const FILTROS = [
  { id: "todos", label: "Todos" },
  { id: "Danza tradicional", label: "Danza" },
  { id: "Teatro ancestral", label: "Teatro" },
  { id: "Concierto", label: "Música" },
  { id: "Espectáculo nocturno", label: "Nocturno" },
];

export default function Espectaculos({ navigation }) {
  const [filtroActivo, setFiltroActivo] = useState("todos");

  const lista = useMemo(() => {
    if (!Array.isArray(espectaculos)) return [];
    if (filtroActivo === "todos") return espectaculos;
    return espectaculos.filter((e) => e.tipo === filtroActivo);
  }, [filtroActivo]);

  const abrirDetalle = (item) =>
    navigation.navigate("DetalleEspectaculo", { espectaculo: item });

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => abrirDetalle(item)}
      style={styles.cardWrap}
    >
      {/* Card estilo "invitación" */}
      <Card style={styles.card} mode="outlined">
        <View style={styles.cardContenido}>
          {/* Imagen superior */}
          <View style={styles.imagenWrap}>
            <Image source={IMAGEN_ESPECTACULO} style={styles.imagen} />
            <View style={styles.imagenOverlay} />

            {/* Badge del tipo */}
            <View style={styles.badgeTipo}>
              <Text style={styles.badgeTipoTexto}>{item.tipo}</Text>
            </View>
          </View>

          {/* Contenido */}
          <View style={styles.cardInfo}>
            {/* Frase de invitación */}
            <Text style={styles.invitacion}>“{item.invitacion}”</Text>

            <Text style={styles.titulo}>{item.nombre}</Text>

            <Text style={styles.descripcion}>{item.descripcion}</Text>

            {/* Fila de datos: duración + ubicación */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon source="clock-outline" size={14} color={COLORES.dorado} />
                <Text style={styles.metaTexto}>{item.duracion}</Text>
              </View>

              <View style={styles.metaItem}>
                <Icon source="map-marker-outline" size={14} color={COLORES.dorado} />
                <Text style={styles.metaTexto}>{item.ubicacion}</Text>
              </View>
            </View>

            {/* Horarios como "sellos" */}
            <View style={styles.horariosRow}>
              {item.horarios.map((h, i) => (
                <View key={i} style={styles.horarioSello}>
                  <Text style={styles.horarioTexto}>{h}</Text>
                </View>
              ))}
            </View>

            <View style={styles.botonWrap}>
              <Text style={styles.botonTexto}>VER DETALLE →</Text>
            </View>
          </View>
        </View>
      </Card>
    </Pressable>
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
        <Text style={styles.tituloSeccion}>ESPECTÁCULOS</Text>
        <Text style={styles.subtituloSeccion}>
          Vive la magia del teatro, la danza y la música andina.
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
          <Text style={styles.mensaje}>No hay espectáculos en este filtro.</Text>
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
  tituloSeccion: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 24,
    letterSpacing: 2,
  },
  subtituloSeccion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    marginTop: 4,
  },

  // FILTROS
  filtrosWrap: { paddingTop: 6, paddingBottom: 6, marginBottom: 12 },
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

  // LISTA
  lista: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 30 },

  // CARD estilo "invitación"
  cardWrap: { marginBottom: 16 },
  card: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.dorado,
    borderWidth: 1.5,
    borderRadius: 20,
    overflow: "hidden",
  },
  cardContenido: { flexDirection: "column" },

  imagenWrap: { width: "100%", height: 150 },
  imagen: { width: "100%", height: "100%" },
  imagenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.40)",
  },
  badgeTipo: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(217,173,56,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeTipoTexto: {
    color: "#1A1208",
    fontFamily: FUENTE_INCA,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  cardInfo: { padding: 16 },

  invitacion: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontStyle: "italic",
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 1.2,
  },
  descripcion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  metaRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 16,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaTexto: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 11,
  },

  // Sellos de horarios
  horariosRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 8,
  },
  horarioSello: {
    borderWidth: 1,
    borderColor: COLORES.dorado,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(217,173,56,0.10)",
  },
  horarioTexto: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  botonWrap: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(217,173,56,0.25)",
    paddingTop: 12,
    alignItems: "flex-end",
  },
  botonTexto: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  mensaje: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginVertical: 30,
  },
});