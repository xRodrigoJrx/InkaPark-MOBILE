// src/navigation/MainTabs.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Icon } from "react-native-paper";

import Inicio from "../../screens/Inicio";
import Atracciones from "../../screens/Atracciones";
import DetalleAtraccion from "../../screens/DetalleAtraccion";
import Espectaculos from "../../screens/Espectaculos";
import DetalleEspectaculo from "../../screens/DetalleEspectaculo";
import Gastronomia from "../../screens/Gastronomia";
import DetalleComida from "../../screens/DetalleComida";
import Entradas from "../../screens/Entradas";
import DetalleEntrada from "../../screens/DetalleEntrada";
import Perfil from "../../screens/Perfil";
import Mapa from "../../screens/Mapa";

import { COLORES, FUENTES } from "../styles/paleta";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function InicioStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="InicioHome" component={Inicio} />
      <Stack.Screen name="Atracciones" component={Atracciones} />
      <Stack.Screen name="DetalleAtraccion" component={DetalleAtraccion} />
      <Stack.Screen name="Espectaculos" component={Espectaculos} />
      <Stack.Screen name="DetalleEspectaculo" component={DetalleEspectaculo} />
      <Stack.Screen name="Gastronomia" component={Gastronomia} />
      <Stack.Screen name="DetalleComida" component={DetalleComida} />
    </Stack.Navigator>
  );
}

function EntradasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EntradasHome" component={Entradas} />
      <Stack.Screen name="DetalleEntrada" component={DetalleEntrada} />
    </Stack.Navigator>
  );
}

export default function MainTabs({ usuario, setSesionActiva }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORES.dorado,
        tabBarInactiveTintColor: COLORES.textoSecundario,
        tabBarStyle: {
          backgroundColor: COLORES.tarjeta,
          borderTopColor: COLORES.bordeTarjeta,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: FUENTES.principal,
          fontSize: 10,
          fontWeight: "bold",
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Inicio"
        component={InicioStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source="home-variant" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Mapa"
        component={Mapa}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source="map-marker-radius" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Entradas"
        component={EntradasStack}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source="ticket-confirmation" size={22} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Perfil"
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source="account-circle" size={22} color={color} />
          ),
        }}
      >
        {() => <Perfil usuario={usuario} setSesionActiva={setSesionActiva} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}