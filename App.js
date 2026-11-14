import React from "react";

import {
  NavigationContainer,
} from "@react-navigation/native";

import { AuthProvider } from
  "./src/context/AuthContext";

import {
  NotificacionesProvider,
  useNotificaciones,
} from "./src/context/NotificacionesContext";

import { navigationRef } from
  "./src/navigation/navigationRef";

import AppStack from
  "./src/navigation/AppStack";

function Navegacion() {
  const {
    navegacionLista,
  } = useNotificaciones();

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={navegacionLista}
    >
      <AppStack />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificacionesProvider>
        <Navegacion />
      </NotificacionesProvider>
    </AuthProvider>
  );
}