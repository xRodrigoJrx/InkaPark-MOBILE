// screens/Gastronomia.js

import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Icon,
  Text,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";

import { COLORES, FUENTES } from "../src/styles/paleta";
import { obtenerComidas } from "../src/services/comidasService";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const IMAGEN_COMIDA = require("../assets/Comida.webp");

const FILTROS = [
  { id: "todo", label: "Todo" },
  { id: "Entrada", label: "Entradas" },
  { id: "Plato principal", label: "Platos" },
  { id: "Postre", label: "Postres" },
  { id: "Bebida", label: "Bebidas" },
];

export default function Gastronomia({ navigation }) {
  const [comidas, setComidas] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState("todo");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intentoCarga, setIntentoCarga] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let cancelado = false;

      async function cargarComidas() {
        setCargando(true);
        setError(false);

        try {
          const datos = await obtenerComidas();

          if (
            !Array.isArray(datos) ||
            datos.some(
              (comida) =>
                typeof comida.nombre !== "string" ||
                typeof comida.categoria !== "string" ||
                typeof comida.precio !== "string" ||
                typeof comida.picante !== "boolean" ||
                typeof comida.vegetariano !== "boolean"
            )
          ) {
            throw new Error(
              "Los datos de comidas no tienen el formato esperado."
            );
          }

          if (!cancelado) {
            setComidas(datos);
          }
        } catch (errorCarga) {
          console.warn(
            "Error al cargar comidas:",
            errorCarga.code,
            errorCarga.message
          );

          if (!cancelado) {
            setError(true);
          }
        } finally {
          if (!cancelado) {
            setCargando(false);
          }
        }
      }

      cargarComidas();

      return () => {
        cancelado = true;
      };
    }, [intentoCarga])
  );

  const lista = useMemo(() => {
    if (filtroActivo === "todo") {
      return comidas;
    }

    return comidas.filter(
      (comida) => comida.categoria === filtroActivo
    );
  }, [comidas, filtroActivo]);

  const abrirDetalle = (item) => {
    navigation.navigate("DetalleComida", { comida: item });
  };

  const reintentarCarga = () => {
    setIntentoCarga((actual) => actual + 1);
  };

  const renderItem = ({ item }) => (
    <Pressable
      onPress={() => abrirDetalle(item)}
      style={styles.cardWrap}
    >
      <Card style={styles.card} mode="outlined">
        <View style={styles.cardContenido}>
          {/* IMAGEN Y PRECIO */}
          <View style={styles.imagenWrap}>
            <Image source={IMAGEN_COMIDA} style={styles.imagen} />
            <View style={styles.imagenOverlay} />

            <View style={styles.precioBadge}>
              <Text style={styles.precioTexto}>
                {item.precio}
              </Text>
            </View>

            {/* ETIQUETAS */}
            <View style={styles.etiquetasWrap}>
              {item.picante && (
                <View style={styles.etiquetaPicante}>
                  <Icon source="fire" size={10} color="#FFF" />
                </View>
              )}

              {item.vegetariano && (
                <View style={styles.etiquetaVeg}>
                  <Icon source="leaf" size={10} color="#FFF" />
                </View>
              )}
            </View>
          </View>

          {/* INFORMACIÓN */}
          <View style={styles.cardInfo}>
            <View style={styles.categoriaBadge}>
              <Text style={styles.categoriaTexto}>
                {item.categoria}
              </Text>
            </View>

            <Text style={styles.titulo}>
              {item.nombre}
            </Text>

            <Text style={styles.descripcion} numberOfLines={2}>
              {item.descripcion}
            </Text>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Icon
                  source="account-multiple"
                  size={12}
                  color={COLORES.doradoClaro}
                />
                <Text style={styles.metaTexto}>
                  {item.porcion}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Icon
                  source="clock-fast"
                  size={12}
                  color={COLORES.doradoClaro}
                />
                <Text style={styles.metaTexto}>
                  {item.tiempoPrep}
                </Text>
              </View>
            </View>

            <View style={styles.botonComprar}>
              <Icon
                source="cart-outline"
                size={14}
                color="#1A1208"
              />
              <Text style={styles.botonComprarTexto}>
                VER DETALLE
              </Text>
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
        <Text style={styles.tituloSeccion}>GASTRONOMÍA</Text>
        <Text style={styles.subtituloSeccion}>
          Sabores del Perú en un solo lugar. ¡Pide y disfruta!
        </Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContenido}
        >
          {FILTROS.map((filtro) => {
            const activo = filtroActivo === filtro.id;

            return (
              <Pressable
                key={filtro.id}
                onPress={() => setFiltroActivo(filtro.id)}
                style={[
                  styles.chip,
                  activo
                    ? styles.chipActivo
                    : styles.chipInactivo,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.chipTexto,
                    activo
                      ? styles.chipTextoActivo
                      : styles.chipTextoInactivo,
                  ]}
                >
                  {filtro.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* CARGA, ERROR O LISTA */}
      {cargando ? (
        <View style={styles.estadoContenido}>
          <ActivityIndicator
            size="large"
            color={COLORES.dorado}
          />
          <Text style={styles.mensaje}>
            Cargando comidas...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.estadoContenido}>
          <Text style={styles.mensaje}>
            No se pudieron cargar las comidas.
            {"\n"}
            Comprueba tu conexión e inténtalo nuevamente.
          </Text>

          <Button
            mode="outlined"
            textColor={COLORES.doradoClaro}
            onPress={reintentarCarga}
          >
            REINTENTAR
          </Button>
        </View>
      ) : (
        <FlatList
          data={lista}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.mensaje}>
              No hay platos en este filtro.
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

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

  tituloWrap: {
    paddingHorizontal: 15,
    marginTop: 4,
    marginBottom: 8,
  },

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

  filtrosWrap: {
    paddingTop: 6,
    paddingBottom: 6,
    marginBottom: 12,
  },

  filtrosContenido: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },

  chip: {
    minWidth: 85,
    height: 40,
    paddingHorizontal: 16,
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
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "bold",
    letterSpacing: 0.3,
    textAlign: "center",
    includeFontPadding: false,
  },

  chipTextoActivo: {
    color: "#1A1208",
  },

  chipTextoInactivo: {
    color: COLORES.crema,
  },

  lista: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 30,
  },

  cardWrap: {
    marginBottom: 14,
  },

  card: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 18,
    overflow: "hidden",
  },

  cardContenido: {
    flexDirection: "row",
    padding: 10,
  },

  imagenWrap: {
    width: 120,
    height: 140,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  },

  imagen: {
    width: "100%",
    height: "100%",
  },

  imagenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  precioBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORES.dorado,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  precioTexto: {
    color: "#1A1208",
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },

  etiquetasWrap: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    gap: 6,
  },

  etiquetaPicante: {
    backgroundColor: "#B71C1C",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  etiquetaVeg: {
    backgroundColor: "#2E7D32",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  cardInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: "space-between",
  },

  categoriaBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(217,173,56,0.15)",
    borderWidth: 1,
    borderColor: "rgba(217,173,56,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },

  categoriaTexto: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 17,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  descripcion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
  },

  metaRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 12,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  metaTexto: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 10,
  },

  botonComprar: {
    marginTop: 8,
    backgroundColor: COLORES.dorado,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignSelf: "flex-start",
    gap: 6,
  },

  botonComprarTexto: {
    color: "#1A1208",
    fontFamily: FUENTE_INCA,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.8,
  },

  estadoContenido: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  mensaje: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginVertical: 30,
  },
});