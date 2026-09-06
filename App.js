import React, { useState } from "react";

import Login from "./screens/Login";
import Registro from "./screens/Registro";

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

  return (
    <Login
      irRegistro={() => setPantalla("registro")}
      usuario={usuario}
    />
  );
}