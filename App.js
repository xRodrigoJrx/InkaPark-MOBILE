import React, { useState } from "react";

import Login from "./screens/Login";
import Registro from "./screens/Registro";
import Inicio from "./screens/Inicio";

export default function App() {
  const [pantalla, setPantalla] = useState("login");
  const [usuario, setUsuario] = useState(null);

  const registrarUsuario = (nuevoUsuario) => {
    setUsuario(nuevoUsuario);
    setPantalla("login");
  };

  if (pantalla === "registro") {
    return (
      <Registro
        irLogin={() => setPantalla("login")}
        registrarUsuario={registrarUsuario}
      />
    );
  }

  if (pantalla === "inicio") {
    return (
      <Inicio
        usuario={usuario}
      />
    );
  }

  return (
    <Login
      irRegistro={() => setPantalla("registro")}
      irInicio={() => setPantalla("inicio")}
      usuario={usuario}
    />
  );
}