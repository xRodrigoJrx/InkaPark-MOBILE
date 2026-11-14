import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import {
  ActivityIndicator,
  Button,
  Text,
} from "react-native-paper";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useRol } from "../hooks/useRol";
import { COLORES } from "../styles/paleta";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

import CompletarPerfil from
  "../../screens/CompletarPerfil";

import PanelPersonal from
  "../../screens/PanelPersonal";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  const {
    cuenta,
    usuario,
    cargandoAuth,
    cargandoPerfil,
    registrando,
    errorSesion,
    reintentarSesion,
    salir,
  } = useAuth();

  const {
    rol,
    cargando: cargandoRol,
    error: errorRol,
    reintentar: reintentarRol,
  } = useRol(cuenta?.uid);

  const esPersonal =
    rol === "administrador" ||
    rol === "operador";

  const cargando =
    cargandoAuth ||
    (
      !!cuenta &&
      (
        cargandoRol ||
        registrando ||
        (
          !errorRol &&
          !esPersonal &&
          cargandoPerfil
        )
      )
    );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={COLORES.dorado}
        />

        <Text style={styles.texto}>
          Preparando tu acceso…
        </Text>
      </View>
    );
  }

  if (errorSesion || (cuenta && errorRol)) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>
          {errorSesion || errorRol}
        </Text>

        <Button
          textColor={COLORES.doradoClaro}
          onPress={
            errorSesion
              ? reintentarSesion
              : reintentarRol
          }
        >
          Reintentar
        </Button>

        {!!cuenta && (
          <Button
            textColor={COLORES.error}
            onPress={() => {
              salir().catch(() => {
                // La pantalla de error permanece disponible.
              });
            }}
          >
            Cerrar sesión
          </Button>
        )}
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!cuenta ? (
        <Stack.Screen
          name="Auth"
          component={AuthStack}
        />
      ) : esPersonal ? (
        <Stack.Screen
          name="Personal"
          navigationKey={`${cuenta.uid}-${rol}`}
        >
          {() => (
            <PanelPersonal rol={rol} />
          )}
        </Stack.Screen>
      ) : !usuario ? (
        <Stack.Screen
          name="CompletarPerfil"
          component={CompletarPerfil}
          navigationKey={cuenta.uid}
        />
      ) : (
        <Stack.Screen
          name="Main"
          component={MainTabs}
          navigationKey={cuenta.uid}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORES.fondo,
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },

  texto: {
    color: COLORES.crema,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 23,
  },
});