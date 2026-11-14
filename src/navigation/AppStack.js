// src/navigation/AppStack.js

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

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { COLORES } from "../styles/paleta";

import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import CompletarPerfil from "../../screens/CompletarPerfil";

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
  } = useAuth();

  const preparandoSesion =
    cargandoAuth ||
    (cuenta && (cargandoPerfil || registrando));

  if (preparandoSesion) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator
          size="large"
          color={COLORES.dorado}
        />

        <Text style={styles.texto}>
          Preparando tu sesión...
        </Text>
      </View>
    );
  }

  if (errorSesion) {
    return (
      <View style={styles.centro}>
        <Text style={styles.texto}>
          {errorSesion}
        </Text>

        <Button
          textColor={COLORES.doradoClaro}
          onPress={reintentarSesion}
        >
          REINTENTAR
        </Button>
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
      ) : !usuario ? (
        <Stack.Screen
          name="CompletarPerfil"
          component={CompletarPerfil}
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
    backgroundColor: COLORES.fondo,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  texto: {
    color: COLORES.crema,
    marginVertical: 20,
    textAlign: "center",
  },
});