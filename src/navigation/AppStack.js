// src/navigation/AppStack.js

import React from "react";

import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthStack from "./AuthStack";

import MainTabs from "./MainTabs";

const Stack = createNativeStackNavigator();

export default function AppStack({
  usuario,

  setUsuario,

  sesionActiva,

  setSesionActiva,
}) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {sesionActiva === false ? (
        <Stack.Screen name="Auth">
          {() => (
            <AuthStack
              usuario={usuario}
              setUsuario={setUsuario}
              setSesionActiva={setSesionActiva}
            />
          )}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="Main">
          {() => (
            <MainTabs
              usuario={usuario}
              setSesionActiva={setSesionActiva}
            />
          )}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
