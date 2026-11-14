// screens/CompletarPerfil.js

import React, { useRef, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Text,
} from "react-native-paper";

import Campo from "../src/components/Campo";

import { useAuth } from "../src/context/AuthContext";
import { mensajeAuth } from "../src/utils/authErrors";
import { COLORES } from "../src/styles/paleta";

export default function CompletarPerfil() {
  const {
    cuenta,
    datosPendientes,
    avisoPerfil,
    errorPerfil,
    completarPerfil,
    reintentarPerfil,
    salir,
  } = useAuth();

  const [nombre, setNombre] = useState(
    datosPendientes?.nombre || ""
  );

  const [telefono, setTelefono] = useState(
    datosPendientes?.telefono || ""
  );

  const [error, setError] = useState("");
  const [operacion, setOperacion] = useState(null);

  const operacionEnCurso = useRef(false);

  const ocupado = operacion !== null;

  async function guardar() {
    if (operacionEnCurso.current) {
      return;
    }

    if (
      !nombre.trim() ||
      nombre.trim().length > 100
    ) {
      setError(
        "Ingresa un nombre de entre 1 y 100 caracteres."
      );
      return;
    }

    if (!/^9[0-9]{8}$/.test(telefono)) {
      setError(
        "El teléfono debe tener nueve dígitos y comenzar con 9."
      );
      return;
    }

    operacionEnCurso.current = true;
    setOperacion("guardar");
    setError("");

    try {
      await completarPerfil({
        nombre,
        telefono,
      });

      // AppStack abrirá Inicio cuando el perfil esté disponible.
    } catch (fallo) {
      setError(mensajeAuth(fallo));
    } finally {
      operacionEnCurso.current = false;
      setOperacion(null);
    }
  }

  async function cerrarSesion() {
    if (operacionEnCurso.current) {
      return;
    }

    operacionEnCurso.current = true;
    setOperacion("salir");
    setError("");

    try {
      await salir();
    } catch (fallo) {
      setError(mensajeAuth(fallo));
    } finally {
      operacionEnCurso.current = false;
      setOperacion(null);
    }
  }

  return (
    <View style={styles.contenedor}>
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.titulo}>
          COMPLETA TU PERFIL
        </Text>

        <Text style={styles.texto}>
          Tu cuenta ya existe. No necesitas registrarte otra vez.
        </Text>

        <Text style={styles.texto}>
          {cuenta?.email}
        </Text>

        {avisoPerfil ? (
          <Text style={styles.texto}>
            {avisoPerfil}
          </Text>
        ) : null}

        {errorPerfil ? (
          <>
            <Text style={styles.error}>
              {errorPerfil}
            </Text>

            <Button
              disabled={ocupado}
              textColor={COLORES.doradoClaro}
              onPress={reintentarPerfil}
            >
              REINTENTAR LECTURA
            </Button>
          </>
        ) : (
          <>
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
              titulo="TELÉFONO"
              placeholder="987654321"
              valor={telefono}
              cambiarValor={(texto) =>
                setTelefono(
                  texto.replace(/[^0-9]/g, "")
                )
              }
              esPassword={false}
              tipoTeclado="phone-pad"
              maxLength={9}
            />

            <Button
              mode="contained"
              disabled={ocupado}
              loading={operacion === "guardar"}
              buttonColor={COLORES.boton}
              textColor={COLORES.botonTexto}
              onPress={guardar}
            >
              GUARDAR PERFIL
            </Button>
          </>
        )}

        {error ? (
          <Text style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Button
          disabled={ocupado}
          loading={operacion === "salir"}
          textColor={COLORES.doradoClaro}
          onPress={cerrarSesion}
        >
          CERRAR SESIÓN
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  contenido: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },

  titulo: {
    color: COLORES.dorado,
    fontSize: 22,
    fontWeight: "bold",
  },

  texto: {
    color: COLORES.crema,
  },

  error: {
    color: COLORES.error,
    marginVertical: 12,
  },
});