// screens/Login.js

import React, { useState } from "react";

import { Image, ScrollView, StyleSheet, View } from "react-native";

import { Button, Snackbar, Text } from "react-native-paper";

import AuthLayout from "../src/components/AuthLayout";

import Campo from "../src/components/Campo";

import { COLORES, FUENTES } from "../src/styles/paleta";

export default function Login({
  navigation,

  usuario,

  setSesionActiva,
}) {
  const [correo, setCorreo] = useState("");

  const [contrasena, setContrasena] = useState("");

  const [mensaje, setMensaje] = useState("");

  const iniciarSesion = () => {
    if (correo.trim() === "" || contrasena.trim() === "") {
      setMensaje("Completa tu correo y contraseña.");

      return;
    }

    if (usuario === null) {
      setMensaje("No existe una cuenta registrada. Regístrate primero.");

      return;
    }

    if (correo.trim() === usuario.correo && contrasena === usuario.contrasena) {
      setSesionActiva(true);

      return;
    }

    setMensaje("Correo o contraseña incorrectos.");
  };

  const recuperarContrasena = () => {
    if (correo.trim() === "") {
      setMensaje("Ingresa tu correo para recuperar tu contraseña.");

      return;
    }

    if (usuario === null) {
      setMensaje("No existe una cuenta registrada.");

      return;
    }

    if (correo.trim() !== usuario.correo) {
      setMensaje("El correo ingresado no está registrado.");

      return;
    }

    setMensaje("Se enviará un enlace de recuperación.");
  };

  return (
    <AuthLayout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenidoScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.login}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>BIENVENIDO</Text>

          <View style={styles.decoracion}>
            <View style={styles.linea} />

            <View style={styles.diamante} />

            <View style={styles.linea} />
          </View>

          <Text style={styles.subtitulo}>TU AVENTURA COMIENZA AQUÍ</Text>

          <Campo
            titulo="CORREO"
            placeholder="correo@gmail.com"
            valor={correo}
            cambiarValor={setCorreo}
            esPassword={false}
            tipoTeclado="email-address"
          />

          <Campo
            titulo="CONTRASEÑA"
            placeholder="••••••••"
            valor={contrasena}
            cambiarValor={setContrasena}
            esPassword={true}
            tipoTeclado="default"
          />

          <Button
            mode="text"
            onPress={recuperarContrasena}
            textColor={COLORES.doradoTexto}
            style={styles.recuperar}
            labelStyle={styles.textoRecuperar}
          >
            ¿Olvidaste tu contraseña?
          </Button>

          <Button
            mode="contained"
            onPress={iniciarSesion}
            buttonColor={COLORES.boton}
            textColor={COLORES.botonTexto}
            style={styles.botonLogin}
            labelStyle={styles.textoBotonLogin}
          >
            INICIAR SESIÓN
          </Button>

          <View style={styles.zonaRegistro}>
            <Text style={styles.textoSinCuenta}>¿No tienes cuenta?</Text>

            <Button
              mode="text"
              onPress={() => navigation.navigate("Registro")}
              textColor={COLORES.doradoClaro}
              labelStyle={styles.textoRegistro}
            >
              Regístrate
            </Button>
          </View>

          <Snackbar
            visible={mensaje !== ""}
            onDismiss={() => setMensaje("")}
            duration={3000}
            style={styles.snackbar}
          >
            <Text style={styles.textoSnackbar}>
              {mensaje}
            </Text>

          </Snackbar>

          <View style={styles.decoracionInferior}>
            <View style={styles.lineaInferior} />

            <View style={styles.diamanteInferior} />

            <View style={styles.lineaInferior} />
          </View>
        </View>
      </ScrollView>
    </AuthLayout>
  );
}
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    width: "100%",
  },

  contenidoScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },

  login: {
    width: "98%",
    maxWidth: 360,

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,

    backgroundColor: COLORES.tarjeta,

    borderWidth: 2,
    borderColor: COLORES.bordeTarjeta,

    borderRadius: 20,

    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    width: "200%",
    height: 70,
    marginBottom: 5,
  },

  titulo: {
    width: "100%",

    color: COLORES.crema,

    fontFamily: FUENTES.principal,

    fontWeight: "bold",

    fontSize: 20,

    letterSpacing: 2.5,

    textAlign: "center",
  },

  decoracion: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 7,

    marginBottom: 9,
  },

  linea: {
    width: 30,

    height: 1,

    backgroundColor: COLORES.dorado,
  },

  diamante: {
    width: 7,

    height: 7,

    marginHorizontal: 9,

    borderWidth: 1,

    borderColor: COLORES.dorado,

    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  subtitulo: {
    width: "100%",

    color: COLORES.doradoClaro,

    fontFamily: FUENTES.principal,

    fontSize: 7,

    letterSpacing: 1.5,

    textAlign: "center",

    marginBottom: 18,
  },

  recuperar: {
    alignSelf: "flex-start",

    marginBottom: 10,

    paddingHorizontal: 0,
  },

  textoRecuperar: {
    fontFamily: FUENTES.principal,

    fontSize: 7,
  },

  botonLogin: {
    width: "100%",

    height: 48,

    borderRadius: 10,

    justifyContent: "center",
  },

  textoBotonLogin: {
    fontFamily: FUENTES.principal,

    fontWeight: "bold",

    fontSize: 9.5,

    letterSpacing: 1.3,
  },

  zonaRegistro: {
    width: "100%",

    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 14,
  },

  textoSinCuenta: {
    color: COLORES.textoSecundario,

    fontFamily: FUENTES.principal,

    fontSize: 8,
  },

  textoRegistro: {
    fontFamily: FUENTES.principal,

    fontWeight: "bold",

    fontSize: 8,
  },

snackbar: {
  backgroundColor: COLORES.error,

  borderRadius: 12,

  marginHorizontal: 20,

  marginBottom: 20,
},

textoSnackbar: {

  color: COLORES.crema,

  fontFamily: FUENTES.principal,

  fontWeight: "bold",

  fontSize: 10,

},

  decoracionInferior: {
    flexDirection: "row",

    justifyContent: "center",

    alignItems: "center",

    marginTop: 15,
  },

  lineaInferior: {
    width: 31,

    height: 1,

    backgroundColor: COLORES.linea,
  },

  diamanteInferior: {
    width: 6,

    height: 6,

    marginHorizontal: 10,

    borderWidth: 1,

    borderColor: COLORES.dorado,

    transform: [
      {
        rotate: "45deg",
      },
    ],
  },
});
