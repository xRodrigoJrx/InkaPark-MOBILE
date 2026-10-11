// src/navigation/AuthStack.js

import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Login from "../../screens/Login";

import Registro from "../../screens/Registro";

const Stack = createNativeStackNavigator();

export default function AuthStack({
  usuario,

  setUsuario,

  setSesionActiva,
}) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login">
        {(props) => (
          <Login
            {...props}
            usuario={usuario}
            setSesionActiva={setSesionActiva}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Registro">
        {(props) => <Registro {...props} registrarUsuario={setUsuario} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
