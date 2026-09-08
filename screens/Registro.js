import React, { useState } from "react";

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AuthLayout from "../src/components/AuthLayout";
import Campo from "../src/components/Campo";

import {
  MensajeValidacion,
  NivelContrasena,
} from "../src/components/Validador";

import {
  COLORES,
  FUENTES,
} from "../styles/paleta";

export default function Registro({
  irLogin,
  irInicio,
  registrarUsuario,
}) {
  const [
    nombre,
    setNombre,
  ] = useState("");

  const [
    correo,
    setCorreo,
  ] = useState("");

  const [
    telefono,
    setTelefono,
  ] = useState("");

  const [
    contrasena,
    setContrasena,
  ] = useState("");

  const [
    confirmar,
    setConfirmar,
  ] = useState("");

  const [
    mensaje,
    setMensaje,
  ] = useState("");

  const correoValido =
    correo.includes("@") &&
    correo.includes(".");

  const telefonoValido =
    telefono.length === 9 &&
    telefono.startsWith("9");

  const contrasenasIguales =
    contrasena !== "" &&
    confirmar !== "" &&
    contrasena === confirmar;

  let nivelContrasena = 0;

  if (
    contrasena.length > 0
  ) {
    nivelContrasena = 1;
  }

  if (
    contrasena.length >= 6
  ) {
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

  const cambiarTelefono =
    (texto) => {
      const soloNumeros =
        texto.replace(
          /[^0-9]/g,
          ""
        );

      setTelefono(
        soloNumeros
      );
    };

  const crearCuenta = () => {
    if (
      nombre.trim() === "" ||
      correo.trim() === "" ||
      telefono.trim() === "" ||
      contrasena.trim() === "" ||
      confirmar.trim() === ""
    ) {
      setMensaje(
        "Completa todos los campos."
      );

      return;
    }

    if (!correoValido) {
      setMensaje(
        "Ingresa un correo válido."
      );

      return;
    }

    if (!telefonoValido) {
      setMensaje(
        "Ingresa un teléfono válido."
      );

      return;
    }

    if (
      nivelContrasena < 3
    ) {
      setMensaje(
        "La contraseña debe ser más segura."
      );

      return;
    }

    if (
      !contrasenasIguales
    ) {
      setMensaje(
        "Las contraseñas no coinciden."
      );

      return;
    }

    const nuevoUsuario = {
      nombre: nombre.trim(),
      correo: correo.trim(),
      telefono: telefono,
      contrasena: contrasena,
    };

    registrarUsuario(
      nuevoUsuario
    );
  };

  return (
    <AuthLayout>
      <View
        style={
          styles.registro
        }
      >
        <Text
          style={
            styles.titulo
          }
        >
          REGÍSTRATE
        </Text>

        <View
          style={
            styles.decoracion
          }
        >
          <View
            style={
              styles.linea
            }
          />

          <View
            style={
              styles.diamante
            }
          />

          <View
            style={
              styles.linea
            }
          />
        </View>

        <Text
          style={
            styles.subtitulo
          }
        >
          CREA TU CUENTA Y EMPIEZA TU AVENTURA
        </Text>

        <Campo
          titulo="NOMBRE COMPLETO"
          placeholder="Tu nombre completo"
          valor={nombre}
          cambiarValor={
            setNombre
          }
          esPassword={false}
          tipoTeclado="default"
        />

        <Campo
          titulo="CORREO"
          placeholder="correo@gmail.com"
          valor={correo}
          cambiarValor={
            setCorreo
          }
          esPassword={false}
          tipoTeclado="email-address"
        />

        <MensajeValidacion
          mostrar={
            correo.length > 3
          }
          correcto={
            correoValido
          }
          textoCorrecto="Correo válido"
          textoError="Correo no válido"
        />

        <Campo
          titulo="TELÉFONO"
          placeholder="987654321"
          valor={telefono}
          cambiarValor={
            cambiarTelefono
          }
          esPassword={false}
          tipoTeclado="phone-pad"
          maxLength={9}
        />

        <MensajeValidacion
          mostrar={
            telefono.length > 0
          }
          correcto={
            telefonoValido
          }
          textoCorrecto="Número válido"
          textoError="Debe tener 9 dígitos y comenzar con 9"
        />

        <Campo
          titulo="CONTRASEÑA"
          placeholder="••••••••"
          valor={contrasena}
          cambiarValor={
            setContrasena
          }
          esPassword={true}
          tipoTeclado="default"
        />

        <NivelContrasena
          nivel={
            nivelContrasena
          }
        />

        <Campo
          titulo="CONFIRMAR CONTRASEÑA"
          placeholder="••••••••"
          valor={confirmar}
          cambiarValor={
            setConfirmar
          }
          esPassword={true}
          tipoTeclado="default"
        />

        <MensajeValidacion
          mostrar={
            confirmar.length > 0
          }
          correcto={
            contrasenasIguales
          }
          textoCorrecto="Las contraseñas coinciden"
          textoError="Las contraseñas no coinciden"
        />

        <TouchableOpacity
          style={
            styles.boton
          }
          onPress={
            crearCuenta
          }
        >
          <Text
            style={
              styles.textoBoton
            }
          >
            CREAR CUENTA
          </Text>
        </TouchableOpacity>

        {mensaje !== "" && (
          <Text
            style={
              styles.mensaje
            }
          >
            {mensaje}
          </Text>
        )}

        <View
          style={
            styles.loginFila
          }
        >
          <Text
            style={
              styles.textoCuenta
            }
          >
            ¿YA TIENES CUENTA?
          </Text>

          <TouchableOpacity
            onPress={
              irLogin
            }
          >
            <Text
              style={
                styles.textoLogin
              }
            >
              INICIA SESIÓN
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  registro: {
    width: "98%",

    maxWidth: 360,

    paddingHorizontal: 17,

    paddingVertical: 15,

    backgroundColor:
      COLORES.tarjeta,

    borderWidth: 2,

    borderColor:
      COLORES.bordeTarjeta,

    borderRadius: 20,

    flexDirection:
      "column",

    justifyContent:
      "center",
  },

  titulo: {
    color:
      COLORES.crema,

    fontFamily:
      FUENTES.principal,

    fontWeight: "bold",

    fontSize: 20,

    letterSpacing: 2.5,

    textAlign: "center",
  },

  decoracion: {
    flexDirection:
      "row",

    justifyContent:
      "center",

    alignItems:
      "center",

    marginTop: 5,

    marginBottom: 7,
  },

  linea: {
    width: 29,

    height: 1,

    backgroundColor:
      COLORES.dorado,
  },

  diamante: {
    width: 7,

    height: 7,

    marginHorizontal: 9,

    borderWidth: 1,

    borderColor:
      COLORES.dorado,

    transform: [
      {
        rotate: "45deg",
      },
    ],
  },

  subtitulo: {
    color:
      COLORES.doradoClaro,

    fontFamily:
      FUENTES.principal,

    fontSize: 6.7,

    letterSpacing: 1.3,

    textAlign: "center",

    marginBottom: 12,
  },

  boton: {
    width: "100%",

    height: 46,

    backgroundColor:
      COLORES.boton,

    borderWidth: 1,

    borderColor:
      COLORES.botonBorde,

    borderRadius: 10,

    justifyContent:
      "center",

    alignItems:
      "center",

    marginTop: 2,
  },

  textoBoton: {
    color:
      COLORES.botonTexto,

    fontFamily:
      FUENTES.principal,

    fontWeight: "bold",

    fontSize: 9,

    letterSpacing: 1.3,
  },

  mensaje: {
    color:
      COLORES.mensaje,

    fontFamily:
      FUENTES.principal,

    fontSize: 7,

    textAlign:
      "center",

    marginTop: 8,
  },

  loginFila: {
    flexDirection:
      "row",

    justifyContent:
      "center",

    alignItems:
      "center",

    marginTop: 11,
  },

  textoCuenta: {
    color:
      COLORES.textoSecundario,

    fontFamily:
      FUENTES.principal,

    fontSize: 6.8,
  },

  textoLogin: {
    color:
      COLORES.doradoClaro,

    fontFamily:
      FUENTES.principal,

    fontWeight: "bold",

    fontSize: 6.8,

    marginLeft: 5,
  },
});