import {
  doc,
  getDocFromServer,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

export const MAX_BOLETOS = 5;

export const PRECIOS = {
  menor: 1000,
  adulto: 1500,
};

function fallo(mensaje, codigo = "failed-precondition") {
  const error = new Error(mensaje);

  // Conserva compatibilidad con el manejo de errores
  // de la pantalla Entradas que ya te entregué.
  error.code = `functions/${codigo}`;

  return error;
}

function usuarioActual() {
  const usuario = auth.currentUser;

  if (!usuario || usuario.isAnonymous) {
    throw fallo(
      "Inicia sesión con tu cuenta.",
      "unauthenticated"
    );
  }

  return usuario;
}

export function soles(centimos) {
  return `S/ ${(centimos / 100).toFixed(2)}`;
}

export function hoyLima() {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valor = (tipo) =>
    partes.find((parte) => parte.type === tipo).value;

  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

export function resumen(items) {
  const elegidos = items.filter(
    (item) => item.seleccionado
  );

  const subtotal = elegidos.reduce(
    (suma, item) => suma + PRECIOS[item.tipo],
    0
  );

  const descuento = elegidos.reduce(
    (suma, item) =>
      suma +
      Math.round(
        PRECIOS[item.tipo] *
        (item.porcentaje || 0) /
        100
      ),
    0
  );

  const total = subtotal - descuento;
  const base = Math.round(total * 100 / 118);

  return {
    cantidad: elegidos.length,
    subtotal,
    descuento,
    base,
    igv: total - base,
    total,
  };
}

function comprobarFecha(fecha) {
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    throw fallo(
      "Usa una fecha con formato AAAA-MM-DD.",
      "invalid-argument"
    );
  }

  const valor = new Date(`${fecha}T12:00:00Z`);

  if (
    Number.isNaN(valor.getTime()) ||
    valor.toISOString().slice(0, 10) !== fecha
  ) {
    throw fallo(
      "La fecha no es válida.",
      "invalid-argument"
    );
  }
}

function normalizarCodigo(valor) {
  if (typeof valor !== "string") {
    throw fallo(
      "Código de cupón inválido.",
      "invalid-argument"
    );
  }

  const codigo = valor.trim().toUpperCase();

  if (!/^[A-Z0-9-]{4,64}$/.test(codigo)) {
    throw fallo(
      "Código de cupón inválido.",
      "invalid-argument"
    );
  }

  return codigo;
}

function porcentajeCupon(snapshot, fecha) {
  if (!snapshot.exists()) {
    throw fallo(
      "El cupón no existe en tu cuenta.",
      "not-found"
    );
  }

  const cupon = snapshot.data();

  if (
    cupon.estado !== "disponible" ||
    ![10, 25].includes(cupon.porcentaje)
  ) {
    throw fallo(
      "Este cupón no está disponible."
    );
  }

  if (
    cupon.venceEn &&
    cupon.venceEn.toMillis() <= Date.now()
  ) {
    throw fallo("El cupón venció.");
  }

  if (
    cupon.fechaVisita &&
    cupon.fechaVisita !== fecha
  ) {
    throw fallo(
      "El cupón no corresponde a esta fecha."
    );
  }

  return cupon.porcentaje;
}

function normalizarSolicitud(datos) {
  const {
    operacionId,
    fecha,
    metodo,
    items,
  } = datos || {};

  if (
    typeof operacionId !== "string" ||
    !/^[a-zA-Z0-9-]{20,64}$/.test(operacionId)
  ) {
    throw fallo(
      "Operación inválida.",
      "invalid-argument"
    );
  }

  comprobarFecha(fecha);

  if (!["yape", "plin"].includes(metodo)) {
    throw fallo(
      "Método inválido.",
      "invalid-argument"
    );
  }

  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > MAX_BOLETOS
  ) {
    throw fallo(
      `Selecciona entre 1 y ${MAX_BOLETOS} boletos.`,
      "invalid-argument"
    );
  }

  const ids = new Set();
  const codigos = new Set();

  const normalizados = items.map((item) => {
    if (
      !item ||
      typeof item.id !== "string" ||
      !/^[a-zA-Z0-9-]{20,64}$/.test(item.id) ||
      !Object.hasOwn(PRECIOS, item.tipo) ||
      ids.has(item.id)
    ) {
      throw fallo(
        "Boleto inválido o repetido.",
        "invalid-argument"
      );
    }

    ids.add(item.id);

    const codigoCupon = item.codigoCupon
      ? normalizarCodigo(item.codigoCupon)
      : null;

    if (codigoCupon && codigos.has(codigoCupon)) {
      throw fallo(
        "Un cupón no puede usarse en dos boletos.",
        "invalid-argument"
      );
    }

    if (codigoCupon) codigos.add(codigoCupon);

    return {
      id: item.id,
      tipo: item.tipo,
      codigoCupon,
    };
  });

  return {
    operacionId,
    fecha,
    metodo,
    items: normalizados,
  };
}

export async function consultarCupon(codigo, fecha) {
  const usuario = usuarioActual();

  comprobarFecha(fecha);

  const normalizado = normalizarCodigo(codigo);

  const snapshot = await getDocFromServer(
    doc(
      db,
      "usuarios",
      usuario.uid,
      "cupones",
      normalizado
    )
  );

  return {
    codigo: normalizado,
    porcentaje: porcentajeCupon(snapshot, fecha),
  };
}

export async function confirmarCompra(datos) {
  const usuario = usuarioActual();
  const uid = usuario.uid;
  const solicitud = normalizarSolicitud(datos);

  const compraRef = doc(
    db,
    "usuarios",
    uid,
    "compras",
    solicitud.operacionId
  );

  const aforoRef = doc(
    db,
    "aforos",
    solicitud.fecha
  );

  const conCupon = solicitud.items.filter(
    (item) => item.codigoCupon
  );

  try {
    return await runTransaction(db, async (tx) => {
      const anterior = await tx.get(compraRef);

      if (anterior.exists()) {
        const guardado = anterior.data();

        // Reconstruir evita depender del orden de las
        // propiedades de los mapas devueltos por Firestore.
        const solicitudAnterior = normalizarSolicitud(
          guardado.solicitud
        );

        if (
          JSON.stringify(solicitudAnterior) !==
          JSON.stringify(solicitud)
        ) {
          throw fallo(
            "La operación ya se utilizó con otros datos.",
            "already-exists"
          );
        }

        return guardado.resultado;
      }

      if (solicitud.fecha < hoyLima()) {
        throw fallo(
          "No puedes comprar para una fecha pasada."
        );
      }

      const aforoSnapshot = await tx.get(aforoRef);

      const cuponSnapshots = [];

      // Todas las lecturas se realizan antes de escribir.
      for (const item of conCupon) {
        const referencia = doc(
          db,
          "usuarios",
          uid,
          "cupones",
          item.codigoCupon
        );

        cuponSnapshots.push({
          referencia,
          item,
          snapshot: await tx.get(referencia),
        });
      }

      const vendidos = aforoSnapshot.exists()
        ? aforoSnapshot.data().vendidos
        : 0;

      if (
        !Number.isInteger(vendidos) ||
        vendidos < 0 ||
        vendidos > 100
      ) {
        throw fallo(
          "El aforo necesita revisión administrativa."
        );
      }

      if (
        vendidos + solicitud.items.length > 100
      ) {
        throw fallo(
          "No quedan suficientes cupos para esa fecha."
        );
      }

      const porcentajes = new Map();

      for (const entrada of cuponSnapshots) {
        porcentajes.set(
          entrada.item.codigoCupon,
          porcentajeCupon(
            entrada.snapshot,
            solicitud.fecha
          )
        );
      }

      const boletos = solicitud.items.map((item) => {
        const precio = PRECIOS[item.tipo];

        const porcentaje = item.codigoCupon
          ? porcentajes.get(item.codigoCupon)
          : 0;

        const descuento = Math.round(
          precio * porcentaje / 100
        );

        return {
          id: item.id,
          uid,
          compraId: solicitud.operacionId,
          fecha: solicitud.fecha,
          tipo: item.tipo,
          precio,
          porcentaje,
          descuento,
          total: precio - descuento,
          codigoCupon: item.codigoCupon,
          estado: "activa",
        };
      });

      const subtotal = boletos.reduce(
        (suma, boleto) => suma + boleto.precio,
        0
      );

      const descuento = boletos.reduce(
        (suma, boleto) =>
          suma + boleto.descuento,
        0
      );

      const total = subtotal - descuento;
      const base = Math.round(total * 100 / 118);

      const resultado = {
        id: solicitud.operacionId,
        fecha: solicitud.fecha,
        fechaCompra: new Date().toISOString(),
        metodo: solicitud.metodo,
        simulacion: true,
        estado: "confirmada",
        boletoIds: boletos.map((boleto) => boleto.id),
        subtotal,
        descuento,
        base,
        igv: total - base,
        total,
        boletos,
      };

      tx.set(compraRef, {
        uid,
        solicitud,
        resultado,
        createdAt: serverTimestamp(),
      });

      tx.set(aforoRef, {
        capacidad: 100,
        vendidos: vendidos + boletos.length,
        compraId: solicitud.operacionId,
        uid,
        updatedAt: serverTimestamp(),
      });

      for (const boleto of boletos) {
        tx.set(doc(db, "boletos", boleto.id), {
          ...boleto,
          createdAt: serverTimestamp(),
        });
      }

      for (const entrada of cuponSnapshots) {
        const indice = boletos.findIndex(
          (boleto) =>
            boleto.codigoCupon ===
            entrada.item.codigoCupon
        );

        tx.update(entrada.referencia, {
          estado: "usado",
          compraId: solicitud.operacionId,
          boletoId: boletos[indice].id,
          indice,
          usedAt: serverTimestamp(),
        });
      }

      return resultado;
    });
  } catch (error) {
    if (error.code === "permission-denied") {
      throw fallo(
        "Firestore rechazó la compra. Comprueba las reglas y que los cupones sigan disponibles.",
        "permission-denied"
      );
    }

    throw error;
  }
}

// La utilizará la futura pantalla del escáner.
// Las reglas comprueban el rol del personal.
export async function validarBoleto(qr) {
  const usuario = usuarioActual();

  if (
    typeof qr !== "string" ||
    !/^INKAPARK:1:[a-zA-Z0-9-]{20,64}$/.test(qr)
  ) {
    throw fallo("El QR no es válido.");
  }

  const boletoId = qr.slice("INKAPARK:1:".length);
  const referencia = doc(db, "boletos", boletoId);

  return runTransaction(db, async (tx) => {
    const snapshot = await tx.get(referencia);

    if (!snapshot.exists()) {
      throw fallo("El boleto no existe.");
    }

    const boleto = snapshot.data();

    if (boleto.estado !== "activa") {
      throw fallo(
        "El boleto ya fue utilizado o no está activo."
      );
    }

    if (boleto.fecha !== hoyLima()) {
      throw fallo(
        "El boleto no corresponde al día de hoy."
      );
    }

    tx.update(referencia, {
      estado: "usada",
      operadorUid: usuario.uid,
      usedAt: serverTimestamp(),
    });

    return {
      aceptado: true,
      boletoId,
      tipo: boleto.tipo,
    };
  });
}