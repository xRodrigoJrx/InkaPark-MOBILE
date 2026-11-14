import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import * as Crypto from "expo-crypto";

import { auth, db } from "../config/firebase";

import {
  PREMIOS,
  cuentaInicial,
  conDistancia,
} from "../utils/caminaCore";

function referencias(uidEsperado) {
  const usuario = auth.currentUser;
  const uid = usuario?.uid;

  if (
    !uid ||
    uid !== uidEsperado ||
    usuario.isAnonymous
  ) {
    throw new Error(
      "La sesión cambió. Vuelve a entrar en tu cuenta."
    );
  }

  return {
    uid,
    ref: doc(
      db,
      "usuarios",
      uid,
      "mision",
      "camina"
    ),
  };
}

function comprobarCuenta(cuenta) {
  if (
    !Number.isInteger(cuenta.distanciaCm) ||
    cuenta.distanciaCm < 0 ||
    cuenta.distanciaCm > 32500 ||
    typeof cuenta.canje10 !== "boolean" ||
    typeof cuenta.canje25 !== "boolean"
  ) {
    throw new Error(
      "La misión tiene datos inválidos. Revisa los campos modificados manualmente."
    );
  }

  const gastoEsperado =
    (cuenta.canje10 ? 100 : 0) +
    (cuenta.canje25 ? 225 : 0);

  if (cuenta.gastados !== gastoEsperado) {
    throw new Error(
      "Los puntos gastados no coinciden con las recompensas canjeadas. No reinicies los canjes; revisa el documento."
    );
  }
}

function necesitaActualizar(anterior, nueva) {
  return (
    anterior.distanciaCm !== nueva.distanciaCm ||
    anterior.puntosObtenidos !==
      nueva.puntosObtenidos ||
    anterior.saldo !== nueva.saldo ||
    anterior.metaCompleta !==
      nueva.metaCompleta
  );
}

function datosProgreso(cuenta) {
  return {
    distanciaCm: cuenta.distanciaCm,
    puntosObtenidos: cuenta.puntosObtenidos,
    saldo: cuenta.saldo,
    metaCompleta: cuenta.metaCompleta,
    updatedAt: serverTimestamp(),
  };
}

export async function prepararMision(uidEsperado) {
  const { ref } = referencias(uidEsperado);

  return runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);

    if (!snapshot.exists()) {
      const cuenta = cuentaInicial();

      tx.set(ref, {
        ...cuenta,
        updatedAt: serverTimestamp(),
      });

      return cuenta;
    }

    const anterior = snapshot.data();

    comprobarCuenta(anterior);

    const nueva = conDistancia(
      anterior,
      anterior.distanciaCm
    );

    if (nueva.saldo < 0) {
      throw new Error(
        "La distancia registrada no alcanza para los premios ya canjeados."
      );
    }

    if (
      necesitaActualizar(anterior, nueva)
    ) {
      tx.update(
        ref,
        datosProgreso(nueva)
      );
    }

    return nueva;
  });
}

export async function sincronizarMision(
  cm,
  uidEsperado
) {
  if (
    !Number.isFinite(cm) ||
    cm < 0
  ) {
    throw new Error("Progreso inválido.");
  }

  const { ref } = referencias(uidEsperado);

  return runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);

    if (!snapshot.exists()) {
      throw new Error(
        "Primero prepara la misión con conexión."
      );
    }

    const anterior = snapshot.data();

    comprobarCuenta(anterior);

    const nueva = conDistancia(
      anterior,
      cm
    );

    if (nueva.saldo < 0) {
      throw new Error(
        "El progreso no coincide con los premios ya canjeados."
      );
    }

    // Se comparan también puntos, saldo y meta.
    // No solamente si aumentó la distancia.
    if (
      necesitaActualizar(anterior, nueva)
    ) {
      tx.update(
        ref,
        datosProgreso(nueva)
      );
    }

    return nueva;
  });
}

export async function canjearPremio(
  id,
  uidEsperado
) {
  const premio = PREMIOS.find(
    (item) => item.id === id
  );

  if (!premio) {
    throw new Error(
      "Recompensa desconocida."
    );
  }

  const { uid, ref } =
    referencias(uidEsperado);

  const codigoNuevo =
    `INKA${premio.porcentaje}-` +
    Crypto.randomUUID().toUpperCase();

  return runTransaction(db, async (tx) => {
    const snapshot = await tx.get(ref);

    if (!snapshot.exists()) {
      throw new Error(
        "La misión todavía no está preparada."
      );
    }

    const cuenta = snapshot.data();

    comprobarCuenta(cuenta);

    // Recupera un canje que ya se confirmó.
    if (cuenta[premio.campo]) {
      const codigoGuardado =
        cuenta[premio.codigo];

      if (
        typeof codigoGuardado !== "string" ||
        !codigoGuardado
      ) {
        throw new Error(
          "La recompensa figura como canjeada, pero no tiene código registrado."
        );
      }

      const anteriorRef = doc(
        db,
        "usuarios",
        uid,
        "cupones",
        codigoGuardado
      );

      const anterior = await tx.get(
        anteriorRef
      );

      if (!anterior.exists()) {
        throw new Error(
          "La recompensa figura como canjeada, pero falta su cupón. No cambies el indicador de canje; debemos revisar ese registro."
        );
      }

      return {
        cuenta,
        codigo: codigoGuardado,
        repetido: true,
      };
    }

    if (
      !Number.isInteger(cuenta.saldo) ||
      cuenta.saldo < premio.costo
    ) {
      throw new Error(
        "Todavía no tienes suficientes puntos confirmados."
      );
    }

    const cuponRef = doc(
      db,
      "usuarios",
      uid,
      "cupones",
      codigoNuevo
    );

    const nueva = {
      ...cuenta,
      [premio.campo]: true,
      [premio.codigo]: codigoNuevo,
      gastados:
        cuenta.gastados + premio.costo,
      saldo:
        cuenta.saldo - premio.costo,
    };

    tx.update(ref, {
      [premio.campo]: true,
      [premio.codigo]: codigoNuevo,
      gastados: nueva.gastados,
      saldo: nueva.saldo,
      updatedAt: serverTimestamp(),
    });

    tx.set(cuponRef, {
      codigo: codigoNuevo,
      recompensa: premio.id,
      porcentaje: premio.porcentaje,
      estado: "disponible",
      createdAt: serverTimestamp(),
    });

    return {
      cuenta: nueva,
      codigo: codigoNuevo,
      repetido: false,
    };
  });
}