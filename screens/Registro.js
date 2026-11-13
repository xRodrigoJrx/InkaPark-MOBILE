import React, { useState } from "react";

import { StyleSheet, View } from "react-native";

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

export default function Registro({
  navigation,

  registrarUsuario,
}) {
  const [nombre, setNombre] = useState("");

  const [correo, setCorreo] = useState("");

  const [telefono, setTelefono] = useState("");

  const [contrasena, setContrasena] = useState("");

  const [confirmar, setConfirmar] = useState("");

  const [mensaje, setMensaje] = useState("");

  const [tipoMensaje, setTipoMensaje] = useState("error");

  const correoValido = correo.includes("@") && correo.includes(".");

  const telefonoValido = telefono.length === 9 && telefono.startsWith("9");

  const contrasenasIguales =
    contrasena !== "" && confirmar !== "" && contrasena === confirmar;

  let nivelContrasena = 0;

  if (contrasena.length > 0) {
    nivelContrasena = 1;
  }

  if (contrasena.length >= 6) {
    nivelContrasena = 2;
  }

  if (
    contrasena.length >= 8 &&
    /[A-Z]/.test(contrasena) &&
    /[0-9]/.test(contrasena)
  ) {
    nivelContrasena = 3;
  }

  if (
    contrasena.length >= 8 &&
    /[A-Z]/.test(contrasena) &&
    /[0-9]/.test(contrasena) &&
    /[!@#$%^&*]/.test(contrasena)
  ) {
    nivelContrasena = 4;
  }

  const cambiarTelefono = (texto) => {
    const numeros = texto.replace(/[^0-9]/g, "");

    setTelefono(numeros);
  };

  const mostrarError = (texto) => {
    setTipoMensaje("error");

    setMensaje(texto);
  };

  const crearCuenta = () => {
    if (
      nombre.trim() === "" ||
      correo.trim() === "" ||
      telefono.trim() === "" ||
      contrasena.trim() === "" ||
      confirmar.trim() === ""
    ) {
      mostrarError("Completa todos los campos.");

      return;
    }

    if (!correoValido) {
      mostrarError("Ingresa un correo válido.");

      return;
    }

    if (!telefonoValido) {
      mostrarError("Ingresa un teléfono válido.");

      return;
    }

    if (nivelContrasena < 3) {
      mostrarError("La contraseña debe ser más segura.");

      return;
    }

    if (!contrasenasIguales) {
      mostrarError("Las contraseñas no coinciden.");

      return;
    }

    const nuevoUsuario = {
      nombre: nombre.trim(),

      correo: correo.trim(),

      telefono,

      contrasena,
    };

    setTipoMensaje("success");

    setMensaje("Cuenta creada correctamente.");

    registrarUsuario(nuevoUsuario);

    navigation.replace("Login");
  };
  return (
    <AuthLayout>
      <View style={styles.registro}>
        <Text style={styles.titulo}>REGÍSTRATE</Text>

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
        />

        <Campo
          titulo="CORREO"
          placeholder="correo@gmail.com"
          valor={correo}
          cambiarValor={setCorreo}
          esPassword={false}
          tipoTeclado="email-address"
        />

        <HelperText
          type={correoValido ? "info" : "error"}
          visible={correo.length > 3}
          style={styles.helper}
        >
          {correoValido ? "Correo válido" : "Correo no válido"}
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
              color={
                nivelContrasena === 4
                  ? COLORES.correcto
                  : nivelContrasena === 3
                    ? COLORES.doradoClaro
                    : COLORES.error
              }
              style={styles.progreso}
            />

            <Text style={styles.textoNivel}>
              {nivelContrasena === 1 && "Contraseña débil"}

              {nivelContrasena === 2 && "Contraseña regular"}

              {nivelContrasena === 3 && "Contraseña buena"}

              {nivelContrasena === 4 && "Contraseña segura"}
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
          onPress={crearCuenta}
          buttonColor={COLORES.boton}
          textColor={COLORES.botonTexto}
          style={styles.boton}
          labelStyle={styles.textoBoton}
        >
          CREAR CUENTA
        </Button>

        <View style={styles.loginFila}>
          <Text style={styles.textoCuenta}>¿YA TIENES CUENTA?</Text>

          <Button
            mode="text"
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
          duration={2500}
          style={[
            styles.snackbar,
            {
              backgroundColor:
                tipoMensaje === "success" ? COLORES.correcto : COLORES.error,
            },
          ]}
        >
          <Text style={styles.textoSnackbar}>{mensaje}</Text>
        </Snackbar>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
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

    transform: [
      {
        rotate: "45deg",
      },
    ],
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

  // MENSAJES DE VALIDACIÓN

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
    borderRadius: 10,
  },

  textoSnackbar: {
    color: COLORES.crema,

    fontFamily: FUENTES.principal,

    fontSize: 10,

    fontWeight: "bold",
  },
});
