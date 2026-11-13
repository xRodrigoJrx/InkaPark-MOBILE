// screens/Inicio.js

import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";

import TarjetaInka from "../src/components/TarjetaInka";
import { COLORES, FUENTES } from "../src/styles/paleta";
import datosAtracciones from "../src/data/atracciones.json";

export default function Inicio({ usuario, navigation }) {
  const { width } = useWindowDimensions();

  const [atracciones, setAtracciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      setAtracciones(datosAtracciones);
    } catch (e) {
      setError(true);
    } finally {
      setCargando(false);
    }
  }, []);

  // 🔥 Navegación
  const irAAtracciones = () => navigation.navigate("Atracciones");
  const irAEspectaculos = () => navigation.navigate("Espectaculos");
  const irAGastronomia = () => navigation.navigate("Gastronomia");

  const irADetalle = (atraccion) =>
    navigation.navigate("DetalleAtraccion", { atraccion });

  return (
    <View style={styles.contenedor}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerContenido}>
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
        </View>

        {/* HERO */}
        <ImageBackground
          source={require("../assets/inicio.png")}
          style={[styles.hero, { width: width - 30 }]}
          imageStyle={styles.imagenHero}
        >
          <View style={styles.capaHero}>
            <Text style={styles.tituloHero}>
              DESCUBRE TU
              {"\n"}
              AVENTURA
            </Text>

            <Text style={styles.descripcionHero}>
              Vive la magia de una civilización milenaria.
            </Text>

            <Text style={styles.detalleHero}>
              MACHU PICCHU · EXPERIENCIA PRINCIPAL
            </Text>

            <Button
              mode="contained"
              buttonColor={COLORES.boton}
              textColor={COLORES.botonTexto}
              style={styles.botonHero}
              onPress={irAAtracciones}
            >
              VER ENTRADAS
            </Button>
          </View>
        </ImageBackground>

        {/* EXPERIENCIAS */}
        <Text style={styles.tituloSeccion}>EXPERIENCIAS</Text>

        <View style={styles.contenedorExperiencias}>
          {/* ATRACCIONES */}
          <Card
            style={styles.cardExperiencia}
            mode="outlined"
            onPress={irAAtracciones}
          >
            <Card.Content style={styles.contenidoExperiencia}>
              <Icon source="map-marker" size={28} color={COLORES.dorado} />
              <Text style={styles.textoExperiencia}>ATRACCIONES</Text>
            </Card.Content>
          </Card>

          {/* ESPECTÁCULOS */}
          <Card
            style={styles.cardExperiencia}
            mode="outlined"
            onPress={irAEspectaculos}
          >
            <Card.Content style={styles.contenidoExperiencia}>
              <Icon source="music" size={28} color={COLORES.dorado} />
              <Text style={styles.textoExperiencia}>ESPECTÁCULOS</Text>
            </Card.Content>
          </Card>

          {/* GASTRONOMÍA */}
          <Card
            style={styles.cardExperiencia}
            mode="outlined"
            onPress={irAGastronomia}
          >
            <Card.Content style={styles.contenidoExperiencia}>
              <Icon
                source="silverware-fork-knife"
                size={28}
                color={COLORES.dorado}
              />
              <Text style={styles.textoExperiencia}>GASTRONOMÍA</Text>
            </Card.Content>
          </Card>
        </View>

        {/* ATRACCIONES DESTACADAS */}
        <View style={styles.filaTitulo}>
          <Text style={styles.tituloSeccion}>ATRACCIONES DESTACADAS</Text>

          <Text style={styles.verMas} onPress={irAAtracciones}>
            VER MÁS
          </Text>
        </View>

        {cargando && (
          <Text style={styles.mensaje}>Cargando experiencias...</Text>
        )}

        {error && (
          <Text style={styles.mensaje}>
            No se pudieron cargar las experiencias.
          </Text>
        )}

        {!cargando && !error && (
          <FlatList
            data={atracciones}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listaAtracciones}
            renderItem={({ item }) => (
              <Pressable onPress={() => irADetalle(item)}>
                <TarjetaInka
                  nombre={item.nombre}
                  descripcion={`${item.categoria} - ${item.descripcion}`}
                />
              </Pressable>
            )}
          />
        )}

        {/* BANNER FINAL */}
        <Card style={styles.bannerFinal} mode="outlined">
          <Card.Content>
            <Text style={styles.tituloBanner}>
              VIVE LA EXPERIENCIA INKAPARK
            </Text>

            <Text style={styles.textoBanner}>
              Reserva tu visita y descubre una aventura llena de historia,
              cultura y naturaleza.
            </Text>

            <Button
              mode="outlined"
              textColor={COLORES.doradoClaro}
              style={styles.botonBanner}
              onPress={irAAtracciones}
            >
              CONOCER MÁS
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  scroll: {
    paddingHorizontal: 15,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    marginTop: 20,
    marginBottom: 15,
  },

  headerContenido: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 55,
    height: 55,
    marginRight: 10,
  },

  tituloHeader: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 2,
  },

  subtituloHeader: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    letterSpacing: 1,
  },

  // HERO
  hero: {
    height: 230,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },

  imagenHero: {
    borderRadius: 20,
  },

  capaHero: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },

  tituloHero: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },

  descripcionHero: {
    color: COLORES.crema,
    fontSize: 13,
    marginTop: 10,
  },

  detalleHero: {
    color: COLORES.doradoClaro,
    fontSize: 9,
    marginTop: 8,
    letterSpacing: 1,
  },

  botonHero: {
    marginTop: 18,
    alignSelf: "flex-start",
    borderRadius: 10,
  },

  // TITULOS
  tituloSeccion: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1.5,
    marginVertical: 12,
  },

  // EXPERIENCIAS
  contenedorExperiencias: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },

  cardExperiencia: {
    flex: 1,
    height: 95,
    marginHorizontal: 4,
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  textoExperiencia: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 9,
    textAlign: "center",
    marginTop: 8,
  },

  // ATRACCIONES
  filaTitulo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  verMas: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 9,
  },

  listaAtracciones: {
    paddingBottom: 20,
  },

  mensaje: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    marginVertical: 20,
  },

  // BANNER FINAL
  bannerFinal: {
    width: "100%",
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 20,
    marginTop: 10,
  },

  tituloBanner: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },

  textoBanner: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 10,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 16,
  },

  botonBanner: {
    marginTop: 15,
    borderColor: COLORES.dorado,
    borderRadius: 10,
    alignSelf: "center",
    width: "80%",
  },

  contenidoExperiencia: {
    justifyContent: "center",
    alignItems: "center",
    padding: 0,
  },
});