import React, { useState } from "react";

import { NavigationContainer } from "@react-navigation/native";

import AppStack from "./src/navigation/AppStack";

export default function App() {
  const [usuario, setUsuario] = useState(null);

  const [sesionActiva, setSesionActiva] = useState(false);

  return (
    <NavigationContainer>
      <AppStack
        usuario={usuario}
        setUsuario={setUsuario}
        sesionActiva={sesionActiva}
        setSesionActiva={setSesionActiva}
      />
    </NavigationContainer>
  );
}
