import React, { useState } from "react";

import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AuthLayout from "../src/components/AuthLayout";
import Campo from "../src/components/Campo";

import {
  COLORES,
  FUENTES,
} from "../styles/paleta";

export default function Login({
  irRegistro,
  irInicio,
  usuario,
}) {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  const iniciarSesion = () => {
    if (
      correo.trim() === "" ||
      contrasena.trim() === ""
    ) {
      setMensaje(
        "Completa tu correo y contraseña."
      );

      return;
    }

    if (usuario === null) {
      setMensaje(
        "No existe una cuenta registrada. Regístrate primero."
      );

      return;
    }

    if (
      correo.trim() === usuario.correo &&
      contrasena === usuario.contrasena
    ) {
      irInicio();
      return;
    }

    setMensaje(
      "Correo o contraseña incorrectos."
    );
  };

  const recuperarContrasena = () => {
    if (correo.trim() === "") {
      setMensaje(
        "Ingresa tu correo para recuperar tu contraseña."
      );

      return;
    }

    if (usuario === null) {
      setMensaje(
        "No existe una cuenta registrada."
      );

      return;
    }

    if (
      correo.trim() !== usuario.correo
    ) {
      setMensaje(
        "El correo ingresado no está registrado."
      );

      return;
    }

    setMensaje(
      "Se enviará un enlace de recuperación."
    );
  };

  return (
    <AuthLayout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.contenidoScroll
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.login}>

          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.titulo}>
            BIENVENIDO
          </Text>

          <View style={styles.decoracion}>
            <View style={styles.linea} />

            <View style={styles.diamante} />

            <View style={styles.linea} />
          </View>

          <Text style={styles.subtitulo}>
            TU AVENTURA COMIENZA AQUÍ
          </Text>

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

          <TouchableOpacity
            style={styles.recuperar}
            onPress={recuperarContrasena}
          >
            <Text style={styles.textoRecuperar}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botonLogin}
            onPress={iniciarSesion}
          >
            <Text style={styles.textoBotonLogin}>
              INICIAR SESIÓN
            </Text>
          </TouchableOpacity>

          <View style={styles.zonaRegistro}>

            <Text style={styles.textoSinCuenta}>
              ¿No tienes cuenta?
            </Text>

            <TouchableOpacity
              onPress={irRegistro}
            >
              <Text style={styles.textoRegistro}>
                Regístrate
              </Text>
            </TouchableOpacity>

          </View>

          {mensaje !== "" && (
            <Text style={styles.mensaje}>
              {mensaje}
            </Text>
          )}

          <View
            style={styles.decoracionInferior}
          >
            <View
              style={styles.lineaInferior}
            />

            <View
              style={styles.diamanteInferior}
            />

            <View
              style={styles.lineaInferior}
            />
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
    flexDirection: "column",
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
    transform: [{ rotate: "45deg" }],
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
    marginBottom: 13,
    paddingVertical: 3,
  },

  textoRecuperar: {
    color: COLORES.doradoTexto,
    fontFamily: FUENTES.principal,
    fontSize: 7,
  },

  botonLogin: {
    width: "100%",
    height: 48,
    backgroundColor: COLORES.boton,
    borderWidth: 1,
    borderColor: COLORES.botonBorde,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textoBotonLogin: {
    color: COLORES.botonTexto,
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
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 8,
    marginLeft: 5,
  },

  mensaje: {
    width: "100%",
    color: COLORES.mensaje,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    textAlign: "center",
    marginTop: 10,
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
    transform: [{ rotate: "45deg" }],
  },

});