// screens/Mapa.js

import React, { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";

/**
 * Tipografía serif/arcaica para títulos y filtros.
 * Da un aire clásico/inca sin cargar fuentes externas.
 */
const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

/**
 * Categorías de filtro (arriba del mapa).
 */
const CATEGORIAS = [
  { id: "todas", label: "Todas" },
  { id: "atracciones", label: "Atracciones" },
  { id: "comida", label: "Comida" },
  { id: "servicios", label: "Servicios" },
  { id: "shows", label: "Shows" },
];

/**
 * Zonas del croquis.
 * top/left/width/height son PORCENTAJES ("%") del tamaño de la imagen.
 * categoria = id de una categoría de filtro.
 */
const ZONAS = [
  {
    id: 1,
    top: "3%",
    left: "5%",
    width: "42%",
    height: "26%",
    titulo: "Zona de Aventura",
    descripcion:
      "Cascadas, puentes colgantes y tirolesas entre montañas. Ideal para los más intrépidos.",
    icono: "image-filter-hdr",
    color: "#8B5E3C",
    categoria: "atracciones",
  },
  {
    id: 2,
    top: "3%",
    left: "53%",
    width: "44%",
    height: "26%",
    titulo: "Zona de Naturaleza",
    descripcion:
      "Senderos ecológicos, aves exóticas y miradores con vista a la selva alta.",
    icono: "leaf",
    color: "#2E7D32",
    categoria: "atracciones",
  },
  {
    id: 3,
    top: "22%",
    left: "3%",
    width: "30%",
    height: "25%",
    titulo: "Zona de Esculturas",
    descripcion:
      "Galería al aire libre con monolitos y figuras talladas inspiradas en la cultura inca.",
    icono: "image-frame",
    color: "#6A1B9A",
    categoria: "atracciones",
  },
  {
    id: 4,
    top: "24%",
    left: "33%",
    width: "35%",
    height: "22%",
    titulo: "Zona de Cultura",
    descripcion:
      "Plaza ceremonial con el Templo del Sol, museos vivos y danzas ancestrales.",
    icono: "white-balance-sunny",
    color: "#D9AD38",
    categoria: "atracciones",
  },
  {
    id: 5,
    top: "30%",
    left: "65%",
    width: "33%",
    height: "26%",
    titulo: "Zona de Espectáculos",
    descripcion:
      "Coliseo principal con shows en vivo, música andina y teatro nocturno.",
    icono: "theater",
    color: "#B71C1C",
    categoria: "shows",
  },
  {
    id: 6,
    top: "48%",
    left: "6%",
    width: "48%",
    height: "26%",
    titulo: "Zona de Comida",
    descripcion:
      "Food court con gastronomía peruana, cafés temáticos y puestos de dulces típicos.",
    icono: "silverware-fork-knife",
    color: "#8B5E3C",
    categoria: "comida",
  },
  {
    id: 7,
    top: "53%",
    left: "58%",
    width: "38%",
    height: "24%",
    titulo: "Zona de Descanso",
    descripcion:
      "Áreas verdes, lagunas y hamacas para relajarte entre aventura y aventura.",
    icono: "spa",
    color: "#00695C",
    categoria: "servicios",
  },
  {
    id: 8,
    top: "80%",
    left: "32%",
    width: "22%",
    height: "14%",
    titulo: "Entrada",
    descripcion:
      "Acceso principal. Aquí validas tu QR y recibes el mapa físico del parque.",
    icono: "login",
    color: "#5D4037",
    categoria: "servicios",
  },
  {
    id: 9,
    top: "80%",
    left: "65%",
    width: "22%",
    height: "14%",
    titulo: "Salida",
    descripcion:
      "Salida del parque. Puedes pedir tu taxi o tomar el bus turístico.",
    icono: "logout",
    color: "#5D4037",
    categoria: "servicios",
  },
];

export default function Mapa() {
  const { width } = useWindowDimensions();
  const [zonaActiva, setZonaActiva] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState("todas");

  const imagenAncho = width - 20;
  const imagenAlto = imagenAncho * 1.25;

  // Zonas visibles según el filtro
  const zonasFiltradas = useMemo(() => {
    if (categoriaActiva === "todas") return ZONAS;
    return ZONAS.filter((z) => z.categoria === categoriaActiva);
  }, [categoriaActiva]);

  return (
    <View style={styles.contenedor}>
      {/* HEADER CON LOGO INKAPARK */}
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <View>
          <Text style={styles.tituloHeader}>INKAPARK</Text>
          <Text style={styles.subtituloHeader}>
            AVENTURA, CULTURA Y NATURALEZA
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* TÍTULO CON FUENTE INCA */}
        <Text style={styles.titulo}>MAPA DEL PARQUE</Text>
        <Text style={styles.subtitulo}>
          Ubícate y encuentra atracciones, comida y servicios.
        </Text>

        {/* FILTROS DESLIZABLES (ARRIBA DEL MAPA) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContenido}
          style={styles.filtrosScroll}
        >
          {CATEGORIAS.map((cat) => {
            const activa = categoriaActiva === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategoriaActiva(cat.id)}
                style={[
                  styles.chip,
                  activa ? styles.chipActiva : styles.chipInactiva,
                ]}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    activa ? styles.chipTextoActivo : styles.chipTextoInactivo,
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* MAPA */}
        <View
          style={{
            width: imagenAncho,
            height: imagenAlto,
            alignSelf: "center",
            marginTop: 14,
          }}
        >
          <Image
            source={require("../assets/mapa.png")}
            style={{
              width: imagenAncho,
              height: imagenAlto,
              borderRadius: 16,
            }}
            resizeMode="cover"
          />

          {/* ZONAS TÁCTILES */}
          {ZONAS.map((zona) => {
            const seleccionada = zonaActiva?.id === zona.id;
            const coincide = zonasFiltradas.some((z) => z.id === zona.id);

            return (
              <Pressable
                key={zona.id}
                onPress={() => setZonaActiva(zona)}
                accessibilityLabel={`Zona ${zona.titulo}`}
                style={[
                  styles.zona,
                  {
                    top: zona.top,
                    left: zona.left,
                    width: zona.width,
                    height: zona.height,
                    borderColor: seleccionada
                      ? COLORES.dorado
                      : coincide && categoriaActiva !== "todas"
                      ? "rgba(217,173,56,0.85)"
                      : "transparent",
                    backgroundColor: seleccionada
                      ? "rgba(217,173,56,0.30)"
                      : coincide && categoriaActiva !== "todas"
                      ? "rgba(217,173,56,0.12)"
                      : "transparent",
                  },
                ]}
              />
            );
          })}
        </View>

        {/* LEYENDA (chips informativos con fuente inca) */}
        <View style={styles.leyenda}>
          {ZONAS.map((zona) => (
            <Pressable
              key={`leyenda-${zona.id}`}
              onPress={() => setZonaActiva(zona)}
              style={styles.itemLeyenda}
            >
              <View
                style={[styles.puntoLeyenda, { backgroundColor: zona.color }]}
              />
              <Text style={styles.textoLeyenda}>{zona.titulo}</Text>
            </Pressable>
          ))}
        </View>

        {/* MODAL DE INFO */}
        <Modal
          visible={!!zonaActiva}
          transparent
          animationType="fade"
          onRequestClose={() => setZonaActiva(null)}
        >
          <Pressable
            style={styles.fondoModal}
            onPress={() => setZonaActiva(null)}
          >
            <Pressable onPress={() => {}} style={{ width: "100%" }}>
              <Card style={styles.modal} mode="outlined">
                <Card.Content>
                  <View style={styles.encabezadoModal}>
                    <View
                      style={[
                        styles.iconoModal,
                        {
                          backgroundColor:
                            (zonaActiva?.color || COLORES.dorado) + "33",
                        },
                      ]}
                    >
                      <Icon
                        source={zonaActiva?.icono || "map-marker"}
                        size={26}
                        color={zonaActiva?.color || COLORES.dorado}
                      />
                    </View>

                    <Text style={styles.tituloModal}>
                      {zonaActiva?.titulo}
                    </Text>
                  </View>

                  <Text style={styles.textoModal}>
                    {zonaActiva?.descripcion}
                  </Text>
                </Card.Content>

                <Card.Actions>
                  <Button
                    textColor={COLORES.dorado}
                    onPress={() => setZonaActiva(null)}
                  >
                    CERRAR
                  </Button>
                </Card.Actions>
              </Card>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 10,
  },
  logo: {
    width: 45,
    height: 45,
    marginRight: 10,
  },
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

  // SCROLL
  scroll: {
    paddingHorizontal: 10,
    paddingBottom: 40,
  },

  // TÍTULOS
  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 22,
    letterSpacing: 2,
    marginTop: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitulo: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    textAlign: "center",
    marginBottom: 12,
  },

  // FILTROS (chips deslizables arriba del mapa)
  filtrosScroll: {
    marginTop: 6,
  },
  filtrosContenido: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    gap: 10,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  chipActiva: {
    backgroundColor: COLORES.dorado,
    borderColor: COLORES.dorado,
  },
  chipInactiva: {
    backgroundColor: "transparent",
    borderColor: COLORES.dorado,
  },
  chipTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  chipTextoActivo: {
    color: COLORES.fondo,
  },
  chipTextoInactivo: {
    color: COLORES.crema,
  },

  // ZONAS
  zona: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 12,
  },

  // LEYENDA
  leyenda: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  itemLeyenda: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  puntoLeyenda: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  textoLeyenda: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 11,
    letterSpacing: 0.3,
  },

  // MODAL
  fondoModal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 20,
  },
  encabezadoModal: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  iconoModal: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tituloModal: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
    flex: 1,
  },
  textoModal: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 12,
    lineHeight: 19,
  },
});