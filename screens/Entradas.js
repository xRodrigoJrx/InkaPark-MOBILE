// screens/Entradas.js

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";
import datosEntradas from "../src/data/entradas.json";

const FUENTE_INCA = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const ESTADOS = [
  { id: "todas", label: "Todas" },
  { id: "activa", label: "Activas" },
  { id: "usada", label: "Usadas" },
  { id: "expirada", label: "Expiradas" },
];

const COLOR_ESTADO = {
  activa: "#4CAF50",
  usada: "#9E9E9E",
  expirada: "#EF5350",
};

const ICONO_ESTADO = {
  activa: "check-circle",
  usada: "history",
  expirada: "close-circle",
};

export default function Entradas({ navigation }) {
  const [entradas, setEntradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroActivo, setFiltroActivo] = useState("todas");

  // 🔹 EFECTO con try/catch + cleanup
  useEffect(() => {
    let cancelado = false;

    const cargarEntradas = async () => {
      try {
        setCargando(true);
        setError(null);

        // Simula latencia de red
        await new Promise((resolve) => setTimeout(resolve, 600));

        if (!Array.isArray(datosEntradas)) {
          throw new Error("Los datos de entradas no tienen el formato esperado");
        }

        if (!cancelado) setEntradas(datosEntradas);
      } catch (e) {
        if (!cancelado) setError(e.message || "No se pudieron cargar las entradas");
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarEntradas();

    return () => {
      cancelado = true;
    };
  }, []);

  // 🔹 MEMO: filtro por estado
  const entradasFiltradas = useMemo(() => {
    if (filtroActivo === "todas") return entradas;
    return entradas.filter((e) => e.estado === filtroActivo);
  }, [entradas, filtroActivo]);

  // 🔹 MEMO: contadores
  const contadores = useMemo(() => {
    return {
      todas: entradas.length,
      activa: entradas.filter((e) => e.estado === "activa").length,
      usada: entradas.filter((e) => e.estado === "usada").length,
      expirada: entradas.filter((e) => e.estado === "expirada").length,
    };
  }, [entradas]);

  const abrirDetalle = (entrada) =>
    navigation.navigate("DetalleEntrada", { entrada });

  // 🔹 Estado: cargando
  if (cargando) {
    return (
      <View style={styles.centrado}>
        <ActivityIndicator size="large" color={COLORES.dorado} />
        <Text style={styles.textoCarga}>Cargando tus entradas...</Text>
      </View>
    );
  }

  // 🔹 Estado: error
  if (error) {
    return (
      <View style={styles.centrado}>
        <Icon source="alert-circle-outline" size={52} color="#EF5350" />
        <Text style={styles.textoError}>{error}</Text>
        <Button
          mode="outlined"
          textColor={COLORES.dorado}
          style={{ marginTop: 16 }}
          onPress={() => navigation.goBack()}
        >
          VOLVER
        </Button>
      </View>
    );
  }

  // 🔹 Estado: lista
  const renderItem = ({ item }) => {
    const colorEstado = COLOR_ESTADO[item.estado] || COLORES.dorado;
    const iconoEstado = ICONO_ESTADO[item.estado] || "ticket";

    return (
      <Pressable onPress={() => abrirDetalle(item)} style={styles.cardWrap}>
        <Card style={styles.card} mode="outlined">
          <View style={styles.cardContenido}>
            <View
              style={[styles.franjaLateral, { backgroundColor: item.color }]}
            />

            <View style={styles.cardInfo}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTipo}>{item.tipo}</Text>
                <View
                  style={[
                    styles.estadoBadge,
                    { backgroundColor: colorEstado + "22" },
                  ]}
                >
                  <Icon source={iconoEstado} size={12} color={colorEstado} />
                  <Text style={[styles.estadoTexto, { color: colorEstado }]}>
                    {item.estado.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardFecha}>
                {item.fecha} · {item.hora}
              </Text>

              <Text style={styles.cardZona}>{item.zona}</Text>

              <View style={styles.cardFooter}>
                <Text style={styles.cardCodigo}>{item.codigo}</Text>
                <Text style={styles.cardPrecio}>{item.precio}</Text>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

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
        <View style={styles.counterBadge}>
          <Text style={styles.counterTexto}>{contadores.activa} activas</Text>
        </View>
      </View>

      {/* TÍTULO */}
      <View style={styles.tituloWrap}>
        <Text style={styles.titulo}>MIS ENTRADAS</Text>
        <Text style={styles.subtitulo}>
          Toca una entrada para ver tu código QR.
        </Text>
      </View>

      {/* FILTROS */}
      <View style={styles.filtrosWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtrosContenido}
        >
          {ESTADOS.map((f) => {
            const activo = filtroActivo === f.id;
            const count = contadores[f.id] || 0;
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
                  style={[
                    styles.chipTexto,
                    activo ? styles.chipTextoActivo : styles.chipTextoInactivo,
                  ]}
                >
                  {f.label}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.chipCount,
                      activo ? styles.chipCountActivo : styles.chipCountInactivo,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipCountTexto,
                        activo
                          ? styles.chipCountTextoActivo
                          : styles.chipCountTextoInactivo,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* LISTA */}
      <FlatList
        data={entradasFiltradas}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon source="ticket-outline" size={60} color={COLORES.doradoClaro} />
            <Text style={styles.emptyTexto}>
              No tienes entradas en este filtro.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: COLORES.fondo },

  centrado: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  textoCarga: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 13,
    marginTop: 14,
  },
  textoError: {
    color: "#EF5350",
    fontFamily: FUENTES.principal,
    fontSize: 14,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 20,
  },

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
  counterBadge: {
    backgroundColor: "rgba(46,125,50,0.20)",
    borderWidth: 1,
    borderColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  counterTexto: {
    color: "#4CAF50",
    fontFamily: FUENTE_INCA,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
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

  filtrosWrap: { paddingTop: 6, paddingBottom: 6, marginBottom: 12 },
  filtrosContenido: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
  },
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  chipTextoActivo: { color: "#1A1208" },
  chipTextoInactivo: { color: COLORES.crema },

  chipCount: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  chipCountActivo: { backgroundColor: "#1A1208" },
  chipCountInactivo: { backgroundColor: "rgba(217,173,56,0.25)" },
  chipCountTexto: { fontFamily: FUENTE_INCA, fontSize: 10, fontWeight: "bold" },
  chipCountTextoActivo: { color: COLORES.dorado },
  chipCountTextoInactivo: { color: COLORES.doradoClaro },

  lista: { paddingHorizontal: 15, paddingTop: 8, paddingBottom: 30 },
  cardWrap: { marginBottom: 12 },

  card: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardContenido: { flexDirection: "row" },
  franjaLateral: { width: 6 },
  cardInfo: { flex: 1, padding: 14 },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTipo: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 0.8,
    flex: 1,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  estadoTexto: {
    fontFamily: FUENTE_INCA,
    fontSize: 9,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  cardFecha: {
    color: COLORES.dorado,
    fontFamily: FUENTE_INCA,
    fontSize: 12,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  cardZona: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    marginTop: 4,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(217,173,56,0.15)",
  },
  cardCodigo: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTE_INCA,
    fontSize: 11,
    letterSpacing: 1,
  },
  cardPrecio: {
    color: COLORES.crema,
    fontFamily: FUENTE_INCA,
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 12,
  },
  emptyTexto: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 13,
    textAlign: "center",
  },
});