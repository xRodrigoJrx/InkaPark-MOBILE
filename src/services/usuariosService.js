// src/services/usuariosService.js

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function crearPerfilSiFalta(
  cuenta,
  { nombre, telefono }
) {
  if (!cuenta || cuenta.isAnonymous || !cuenta.email) {
    throw new Error(
      "Se necesita una cuenta con correo y contraseña."
    );
  }

  const nombreLimpio = nombre.trim();

  if (
    nombreLimpio.length < 1 ||
    nombreLimpio.length > 100
  ) {
    throw new Error(
      "El nombre debe tener entre 1 y 100 caracteres."
    );
  }

  if (!/^9[0-9]{8}$/.test(telefono)) {
    throw new Error(
      "El teléfono debe tener nueve dígitos y comenzar con 9."
    );
  }

  const referencia = doc(
    db,
    "usuarios",
    cuenta.uid
  );

  await runTransaction(db, async (transaccion) => {
    const existente = await transaccion.get(referencia);

    // Si el perfil ya existe, no lo reemplazamos.
    if (existente.exists()) {
      return;
    }

    transaccion.set(referencia, {
      nombre: nombreLimpio,
      correo: cuenta.email,
      telefono,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });
}