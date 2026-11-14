// screens/Registro.js

import React, { useRef, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  HelperText,
  ProgressBar,
  Snackbar,
  Text,
} from "react-native-paper";

import AuthLayout from "../src/components/AuthLayout";
import Campo from "../src/components/Campo";

import { COLORES, FUENTES } from "../src/styles/paleta";
import { useAuth } from "../src/context/AuthContext";
import { mensajeAuth } from "../src/utils/authErrors";

export default function Registro({ navigation }) {
  const { registrar } = useAuth();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const operacionEnCurso = useRef(false);

  const correoValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());

  const telefonoValido = /^9[0-9]{8}$/.test(telefono);

  const contrasenasIguales =
    contrasena !== "" &&
    confirmar !== "" &&
    contrasena === confirmar;

  const contrasenaValida =
    contrasena.length >= 8 &&
    /[A-Z]/.test(contrasena) &&
    /[0-9]/.test(contrasena);

  let nivelContrasena = 0;

  if (contrasena.length > 0) {
    nivelContrasena = 1;
  }

  if (contrasena.length >= 6) {
    nivelContrasena = 2;
  }

  if (contrasenaValida) {
    nivelContrasena = 3;
  }

  if (
    contrasenaValida &&
    /[!@#$%^&*]/.test(contrasena)
  ) {
    nivelContrasena = 4;
  }

  const textosNivel = [
    "",
    "Contraseña débil",
    "Contraseña regular",
    "Contraseña buena",
    "Contraseña segura",
  ];

  const colorNivel =
    nivelContrasena === 4
      ? COLORES.correcto
      : nivelContrasena === 3
        ? COLORES.doradoClaro
        : COLORES.error;

  function cambiarTelefono(texto) {
    setTelefono(texto.replace(/[^0-9]/g, ""));
  }

  async function crearCuenta() {
    if (operacionEnCurso.current) {
      return;
    }

    if (
      !nombre.trim() ||
      !correo.trim() ||
      !telefono ||
      !contrasena.trim() ||
      !confirmar.trim()
    ) {
      setMensaje("Completa todos los campos.");
      return;
    }

    if (nombre.trim().length > 100) {
      setMensaje(
        "El nombre debe tener como máximo 100 caracteres."
      );
      return;
    }

    if (!correoValido || correo.trim().length > 254) {
      setMensaje("Ingresa un correo válido.");
      return;
    }

    if (!telefonoValido) {
      setMensaje(
        "El teléfono debe tener nueve dígitos y comenzar con 9."
      );
      return;
    }

    if (!contrasenaValida) {
      setMensaje(
        "La contraseña debe tener al menos ocho caracteres, " +
          "una mayúscula y un número."
      );
      return;
    }

    if (!contrasenasIguales) {
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    operacionEnCurso.current = true;
    setOcupado(true);
    setMensaje("");

    try {
      await registrar({
        nombre,
        correo,
        telefono,
        contrasena,
      });

      // No navegar manualmente a Login.
      // Firebase crea la cuenta e inicia sesión.
      // AppStack abre Inicio o CompletarPerfil.
    } catch (error) {
      setMensaje(mensajeAuth(error));
    } finally {
      operacionEnCurso.current = false;
      setOcupado(false);
    }
  }

  return (
    <AuthLayout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contenidoScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.registro}>
          <Text style={styles.titulo}>
            REGÍSTRATE
          </Text>

          <View style={styles.decoracion}>
            <View style={styles.linea} />
            <View style={styles.diamante} />
            <View style={styles.linea} />
          </View>

          <Text style={styles.subtitulo}>
            CREA TU CUENTA Y EMPIEZA TU AVENTURA
          </Text>

          <Campo
            titulo="NOMBRE COMPLETO"
            placeholder="Tu nombre completo"
            valor={nombre}
            cambiarValor={setNombre}
            esPassword={false}
            tipoTeclado="default"
            maxLength={100}
          />

          <Campo
            titulo="CORREO"
            placeholder="correo@gmail.com"
            valor={correo}
            cambiarValor={setCorreo}
            esPassword={false}
            tipoTeclado="email-address"
            maxLength={254}
          />

          <HelperText
            type={correoValido ? "info" : "error"}
            visible={correo.length > 3}
            style={styles.helper}
          >
            {correoValido
              ? "Correo válido"
              : "Correo no válido"}
          </HelperText>

          <Campo
            titulo="TELÉFONO"
            placeholder="987654321"
            valor={telefono}
            cambiarValor={cambiarTelefono}
            esPassword={false}
            tipoTeclado="phone-pad"
            maxLength={9}
          />

          <HelperText
            type={telefonoValido ? "info" : "error"}
            visible={telefono.length > 0}
            style={styles.helper}
          >
            {telefonoValido
              ? "Número válido"
              : "Debe tener 9 dígitos y comenzar con 9"}
          </HelperText>

          <Campo
            titulo="CONTRASEÑA"
            placeholder="••••••••"
            valor={contrasena}
            cambiarValor={setContrasena}
            esPassword={true}
            tipoTeclado="default"
          />

          {nivelContrasena > 0 && (
            <View style={styles.nivel}>
              <ProgressBar
                progress={nivelContrasena / 4}
                color={colorNivel}
                style={styles.progreso}
              />

              <Text style={styles.textoNivel}>
                {textosNivel[nivelContrasena]}
              </Text>
            </View>
          )}

          <Campo
            titulo="CONFIRMAR CONTRASEÑA"
            placeholder="••••••••"
            valor={confirmar}
            cambiarValor={setConfirmar}
            esPassword={true}
            tipoTeclado="default"
          />

          <HelperText
            type={contrasenasIguales ? "info" : "error"}
            visible={confirmar.length > 0}
            style={styles.helper}
          >
            {contrasenasIguales
              ? "Las contraseñas coinciden"
              : "Las contraseñas no coinciden"}
          </HelperText>

          <Button
            mode="contained"
            disabled={ocupado}
            loading={ocupado}
            onPress={crearCuenta}
            buttonColor={COLORES.boton}
            textColor={COLORES.botonTexto}
            style={styles.boton}
            labelStyle={styles.textoBoton}
          >
            CREAR CUENTA
          </Button>

          <View style={styles.loginFila}>
            <Text style={styles.textoCuenta}>
              ¿YA TIENES CUENTA?
            </Text>

            <Button
              mode="text"
              disabled={ocupado}
              onPress={() => navigation.navigate("Login")}
              textColor={COLORES.doradoClaro}
              labelStyle={styles.textoLogin}
            >
              INICIA SESIÓN
            </Button>
          </View>

          <Snackbar
            visible={mensaje !== ""}
            onDismiss={() => setMensaje("")}
            duration={6000}
            style={styles.snackbar}
          >
            <Text style={styles.textoSnackbar}>
              {mensaje}
            </Text>
          </Snackbar>
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

  registro: {
    width: "98%",
    maxWidth: 360,
    paddingHorizontal: 17,
    paddingVertical: 12,
    backgroundColor: COLORES.tarjeta,
    borderWidth: 2,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 20,
    justifyContent: "center",
  },

  titulo: {
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
    marginTop: 5,
    marginBottom: 6,
  },

  linea: {
    width: 29,
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
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    letterSpacing: 1.3,
    textAlign: "center",
    marginBottom: 10,
  },

  nivel: {
    width: "100%",
    marginTop: -5,
    marginBottom: 5,
  },

  progreso: {
    height: 5,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  textoNivel: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    marginTop: 3,
  },

  helper: {
    marginTop: -8,
    marginBottom: 4,
    paddingHorizontal: 0,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    lineHeight: 10,
  },

  boton: {
    width: "100%",
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 5,
  },

  textoBoton: {
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 9,
    letterSpacing: 1.3,
  },

  loginFila: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },

  textoCuenta: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 7,
  },

  textoLogin: {
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 7,
  },

  snackbar: {
    backgroundColor: COLORES.error,
    borderRadius: 10,
  },

  textoSnackbar: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 10,
    fontWeight: "bold",
  },
});