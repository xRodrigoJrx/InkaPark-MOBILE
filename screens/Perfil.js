// screens/Perfil.js

import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import {
  Button,
  Card,
  Dialog,
  Icon,
  Portal,
  Text,
} from "react-native-paper";

import { COLORES, FUENTES } from "../src/styles/paleta";

function OpcionPerfil({ icono, titulo, descripcion }) {
  return (
    <Card mode="outlined" style={styles.opcion}>
      <View style={styles.opcionContenido}>
        <View style={styles.iconoOpcion}>
          <Icon source={icono} size={22} color={COLORES.dorado} />
        </View>

        <View style={styles.textosOpcion}>
          <Text style={styles.tituloOpcion}>{titulo}</Text>
          <Text style={styles.descripcionOpcion}>{descripcion}</Text>
        </View>

        <Icon source="chevron-right" size={22} color={COLORES.doradoClaro} />
      </View>
    </Card>
  );
}

export default function Perfil({ usuario, setSesionActiva }) {
  const { width } = useWindowDimensions();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);

  const cerrarSesion = () => {
    setMostrarModal(false);
    setCerrandoSesion(true);

    setTimeout(() => {
      setCerrandoSesion(false);
      setSesionActiva(false);
    }, 1500);
  };

  if (cerrandoSesion) {
    return (
      <View style={styles.pantallaCarga}>
        <Text style={styles.logoCarga}>INKAPARK</Text>

        <ActivityIndicator
          size="large"
          color={COLORES.dorado}
          style={styles.loader}
        />

        <Text style={styles.textoCarga}>Cerrando sesión...</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* HEADER (igual que Inicio) */}
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

        {/* TÍTULO DE SECCIÓN */}
        <Text style={styles.tituloSeccion}>MI PERFIL</Text>

        <Text style={styles.subtituloSeccion}>
          Administra tu cuenta y preferencias.
        </Text>

        {/* TARJETA USUARIO */}
        <Card style={styles.tarjetaUsuario} mode="outlined">
          <View style={styles.usuarioContenido}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTexto}>
                {usuario?.nombre
                  ? usuario.nombre.substring(0, 2).toUpperCase()
                  : "RN"}
              </Text>
            </View>

            <View style={styles.infoUsuario}>
              <Text style={styles.nombreUsuario}>
                {usuario?.nombre || "RODRIGO NAVARRO"}
              </Text>

              <Text style={styles.correoUsuario}>
                {usuario?.correo || "correo@email.com"}
              </Text>
            </View>
          </View>
        </Card>

        {/* LISTA DE OPCIONES */}
        <Text style={styles.tituloSeccion}>OPCIONES</Text>

        <View style={styles.listaOpciones}>
          <OpcionPerfil
            icono="ticket-confirmation-outline"
            titulo="Mis entradas"
            descripcion="Accesos y códigos QR"
          />

          <OpcionPerfil
            icono="heart-outline"
            titulo="Favoritos"
            descripcion="Atracciones guardadas"
          />

          <OpcionPerfil
            icono="bell-outline"
            titulo="Notificaciones"
            descripcion="Alertas y horarios"
          />

          <OpcionPerfil
            icono="help-circle-outline"
            titulo="Ayuda"
            descripcion="Preguntas frecuentes"
          />

          <OpcionPerfil
            icono="cog-outline"
            titulo="Configuración"
            descripcion="Preferencias de la app"
          />
        </View>

        {/* BOTÓN CERRAR SESIÓN */}
        <Button
          mode="outlined"
          textColor={COLORES.doradoClaro}
          style={styles.botonCerrar}
          labelStyle={styles.textoCerrar}
          onPress={() => setMostrarModal(true)}
        >
          CERRAR SESIÓN
        </Button>
      </ScrollView>

      {/* MODAL DE CONFIRMACIÓN */}
      <Portal>
        <Dialog
          visible={mostrarModal}
          onDismiss={() => setMostrarModal(false)}
          style={styles.modal}
        >
          <Dialog.Title style={styles.tituloModal}>
            Cerrar sesión
          </Dialog.Title>

          <Dialog.Content>
            <Text style={styles.textoModal}>
              ¿Está seguro que desea cerrar sesión?
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              textColor={COLORES.textoSecundario}
              onPress={() => setMostrarModal(false)}
            >
              CANCELAR
            </Button>

            <Button textColor={COLORES.dorado} onPress={cerrarSesion}>
              SALIR
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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

  // HEADER (idéntico a Inicio)

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

  // TÍTULOS DE SECCIÓN

  tituloSeccion: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 1.5,
    marginVertical: 12,
  },

  subtituloSeccion: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 15,
  },

  // TARJETA USUARIO

  tarjetaUsuario: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 20,
    marginBottom: 20,
  },

  usuarioContenido: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORES.dorado,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },

  avatarTexto: {
    color: COLORES.fondo,
    fontFamily: FUENTES.principal,
    fontSize: 20,
    fontWeight: "bold",
  },

  infoUsuario: {
    flex: 1,
  },

  nombreUsuario: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  correoUsuario: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 12,
    marginTop: 4,
  },

  // LISTA DE OPCIONES

  listaOpciones: {
    marginBottom: 10,
  },

  opcion: {
    backgroundColor: COLORES.tarjeta,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 15,
    marginBottom: 10,
  },

  opcionContenido: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },

  iconoOpcion: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  textosOpcion: {
    flex: 1,
    marginLeft: 14,
  },

  tituloOpcion: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 14,
    fontWeight: "600",
  },

  descripcionOpcion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 10,
    marginTop: 2,
  },

  // BOTÓN CERRAR SESIÓN

  botonCerrar: {
    marginTop: 10,
    marginBottom: 20,
    borderColor: COLORES.dorado,
    borderRadius: 10,
  },

  textoCerrar: {
    fontFamily: FUENTES.principal,
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1,
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

  // MODAL

  modal: {
    backgroundColor: COLORES.tarjeta,
    borderRadius: 20,
    borderColor: COLORES.bordeTarjeta,
    borderWidth: 1,
  },

  tituloModal: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  textoModal: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 13,
  },

  // PANTALLA DE CARGA

  pantallaCarga: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    justifyContent: "center",
    alignItems: "center",
  },

  logoCarga: {
    color: COLORES.dorado,
    fontFamily: FUENTES.principal,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 3,
    marginBottom: 24,
  },

  loader: {
    marginVertical: 16,
  },

  textoCarga: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 14,
    letterSpacing: 1,
  },
});