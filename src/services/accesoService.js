import AsyncStorage from
  "@react-native-async-storage/async-storage";

import * as Crypto from "expo-crypto";

import {
  getIdTokenResult,
} from "firebase/auth";

import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

import { hoyLima } from "./entradasService";

function clave(uid) {
  return `@inkapark/acceso-pendiente/v1/${uid}`;
}

function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.code = codigo;
  return error;
}

export async function leerValidacionPendiente(uid) {
  const texto = await AsyncStorage.getItem(
    clave(uid)
  );

  if (!texto) return null;

  const datos = JSON.parse(texto);

  if (
    !datos ||
    datos.uid !== uid ||
    typeof datos.boletoId !== "string" ||
    !/^[a-zA-Z0-9-]{20,64}$/.test(datos.boletoId) ||
    typeof datos.validacionId !== "string" ||
    !/^[a-zA-Z0-9-]{20,64}$/.test(
      datos.validacionId
    )
  ) {
    throw new Error(
      "La validación pendiente necesita revisión. No borres los datos de la app antes de comprobar el boleto."
    );
  }

  return datos;
}

async function comprobarPersonal() {
  const usuario = auth.currentUser;

  if (!usuario || usuario.isAnonymous) {
    throw crearError(
      "Tu sesión no está disponible. Vuelve a iniciar sesión.",
      "unauthenticated"
    );
  }

  const token = await getIdTokenResult(usuario);

  if (
    ![
      "administrador",
      "operador",
    ].includes(token.claims.rol)
  ) {
    throw crearError(
      "Esta cuenta no tiene permiso para validar entradas.",
      "permission-denied"
    );
  }

  return usuario;
}

function comprobarQr(qr) {
  if (
    typeof qr !== "string" ||
    !/^INKAPARK:1:[a-zA-Z0-9-]{20,64}$/.test(qr)
  ) {
    throw crearError(
      "Este código no corresponde a un boleto de InkaPark.",
      "qr-invalido"
    );
  }

  return qr.slice("INKAPARK:1:".length);
}

export async function procesarAcceso(qr = null) {
  const usuario = await comprobarPersonal();
  const uid = usuario.uid;

  let pendiente = await leerValidacionPendiente(
    uid
  );

  const recuperando = !!pendiente;

  if (!pendiente) {
    const boletoId = comprobarQr(qr);

    pendiente = {
      uid,
      boletoId,
      validacionId: Crypto.randomUUID(),
    };

    // No enviamos una validación si antes no pudimos
    // conservar el identificador de recuperación.
    await AsyncStorage.setItem(
      clave(uid),
      JSON.stringify(pendiente)
    );
  }

  const referencia = doc(
    db,
    "boletos",
    pendiente.boletoId
  );

  let resultado;

  try {
    resultado = await runTransaction(
      db,
      async (tx) => {
        const snapshot = await tx.get(
          referencia
        );

        if (!snapshot.exists()) {
          return {
            aceptado: false,
            titulo: "Boleto no encontrado",
            mensaje:
              "El código no corresponde a un boleto registrado.",
          };
        }

        const boleto = snapshot.data();

        // Si nuestra operación ya se confirmó,
        // recuperamos su resultado sin volver a consumir.
        if (
          boleto.estado === "usada" &&
          boleto.validacionId ===
            pendiente.validacionId &&
          boleto.operadorUid === uid
        ) {
          return {
            aceptado: true,
            recuperado: true,
            boletoId: snapshot.id,
            tipo: boleto.tipo,
            fecha: boleto.fecha,
            titulo: "Validación previa confirmada",
            mensaje:
              "La operación pendiente sí quedó registrada. El boleto ya está utilizado; no autorices un segundo ingreso.",
          };
        }

        if (boleto.estado === "usada") {
          return {
            aceptado: false,
            boletoId: snapshot.id,
            titulo: "Boleto ya utilizado",
            mensaje:
              "Este boleto ya registró un ingreso. No puede aceptarse otra vez.",
          };
        }

        if (boleto.estado !== "activa") {
          return {
            aceptado: false,
            boletoId: snapshot.id,
            titulo: "Boleto no activo",
            mensaje:
              "El boleto no está habilitado para ingresar.",
          };
        }

        if (boleto.fecha !== hoyLima()) {
          return {
            aceptado: false,
            boletoId: snapshot.id,
            fecha: boleto.fecha,
            titulo:
              boleto.fecha < hoyLima()
                ? "Boleto expirado"
                : "Fecha de visita diferente",
            mensaje:
              `La fecha de visita es ${boleto.fecha}. Solo se acepta el día indicado.`,
          };
        }

        if (
          auth.currentUser?.uid !== uid
        ) {
          throw crearError(
            "La sesión cambió durante la validación.",
            "unauthenticated"
          );
        }

        tx.update(referencia, {
          estado: "usada",
          operadorUid: uid,
          validacionId:
            pendiente.validacionId,
          usedAt: serverTimestamp(),
        });

        return {
          aceptado: true,
          recuperado: false,
          boletoId: snapshot.id,
          tipo: boleto.tipo,
          fecha: boleto.fecha,
          titulo: "Ingreso autorizado",
          mensaje:
            "La validación se confirmó en Firebase. Este boleto ya no permite otro ingreso.",
        };
      }
    );
  } catch (error) {
    // Con estos errores no se confirmó la escritura.
    // Los errores de conexión conservan el intento.
    const definitivos = [
      "permission-denied",
      "unauthenticated",
      "invalid-argument",
    ];

    if (definitivos.includes(error.code)) {
      await AsyncStorage.removeItem(
        clave(uid)
      );
    }

    if (error.code === "permission-denied") {
      throw new Error(
        "Firebase rechazó la validación. Comprueba el rol de la cuenta y las reglas. Si acabas de asignar el rol, cierra sesión y vuelve a entrar."
      );
    }

    throw error;
  }

  // Si falla este borrado, el intento continúa guardado.
  // Recuperarlo reconocerá la validación ya registrada.
  try {
    await AsyncStorage.removeItem(clave(uid));
  } catch {
    throw new Error(
      "Se obtuvo el resultado, pero no pudimos cerrar el intento local. Pulsa Recuperar resultado antes de escanear otra entrada."
    );
  }

  return {
    ...resultado,
    desdeRecuperacion: recuperando,
  };
}