const { initializeApp } = require("firebase-admin/app");
const {
  getFirestore,
  FieldValue,
} = require("firebase-admin/firestore");

const {
  onCall,
  HttpsError,
} = require("firebase-functions/v2/https");

const {
  createHash,
  randomBytes,
} = require("node:crypto");

initializeApp();

const db = getFirestore();

const REGION = "us-central1";
const CAPACIDAD = 100;
const PRECIOS = {
  menor: 1000,
  adulto: 1500,
};

function fechaLima() {
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

function usuario(request) {
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Inicia sesión para continuar."
    );
  }

  if (
    request.auth.token.firebase?.sign_in_provider !==
    "password"
  ) {
    throw new HttpsError(
      "permission-denied",
      "Utiliza una cuenta con correo y contraseña."
    );
  }

  return request.auth.uid;
}

function codigoValido(valor) {
  if (typeof valor !== "string") {
    throw new HttpsError(
      "invalid-argument",
      "Código de cupón inválido."
    );
  }

  const codigo = valor.trim().toUpperCase();

  if (!/^[A-Z0-9-]{4,64}$/.test(codigo)) {
    throw new HttpsError(
      "invalid-argument",
      "Código de cupón inválido."
    );
  }

  return codigo;
}

function validarCupon(snapshot, fecha) {
  if (!snapshot.exists) {
    throw new HttpsError(
      "not-found",
      "El cupón no pertenece a tu cuenta o no existe."
    );
  }

  const cupon = snapshot.data();

  if (
    cupon.estado !== "disponible" ||
    ![10, 25].includes(cupon.porcentaje)
  ) {
    throw new HttpsError(
      "failed-precondition",
      "El cupón no está disponible."
    );
  }

  if (
    cupon.venceEn &&
    typeof cupon.venceEn.toMillis === "function" &&
    cupon.venceEn.toMillis() <= Date.now()
  ) {
    throw new HttpsError(
      "failed-precondition",
      "El cupón venció."
    );
  }

  if (
    cupon.fechaVisita &&
    cupon.fechaVisita !== fecha
  ) {
    throw new HttpsError(
      "failed-precondition",
      "El cupón no corresponde a esta fecha de visita."
    );
  }

  return cupon.porcentaje;
}

function comprobarFecha(fecha) {
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Usa una fecha con formato AAAA-MM-DD."
    );
  }

  const fechaObjeto = new Date(`${fecha}T12:00:00Z`);

  if (
    Number.isNaN(fechaObjeto.getTime()) ||
    fechaObjeto.toISOString().slice(0, 10) !== fecha
  ) {
    throw new HttpsError(
      "invalid-argument",
      "La fecha no es válida."
    );
  }
}

exports.consultarCupon = onCall(
  { region: REGION },
  async (request) => {
    const uid = usuario(request);
    const codigo = codigoValido(request.data?.codigo);
    const fecha = request.data?.fecha;

    comprobarFecha(fecha);

    const snapshot = await db
      .doc(`usuarios/${uid}/cupones/${codigo}`)
      .get();

    const porcentaje = validarCupon(snapshot, fecha);

    return {
      codigo,
      porcentaje,
    };
  }
);

exports.confirmarCompra = onCall(
  { region: REGION },
  async (request) => {
    const uid = usuario(request);

    const {
      operacionId,
      fecha,
      metodo,
      items,
    } = request.data || {};

    if (
      typeof operacionId !== "string" ||
      !/^[a-zA-Z0-9-]{20,64}$/.test(operacionId)
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Identificador de operación inválido."
      );
    }

    comprobarFecha(fecha);

    if (!["yape", "plin"].includes(metodo)) {
      throw new HttpsError(
        "invalid-argument",
        "Método de pago inválido."
      );
    }

    if (
      !Array.isArray(items) ||
      items.length < 1 ||
      items.length > 20
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Selecciona entre 1 y 20 boletos."
      );
    }

    const ids = new Set();
    const codigos = new Set();

    const lineas = items.map((item) => {
      if (
        !item ||
        typeof item.id !== "string" ||
        !/^[a-zA-Z0-9-]{20,64}$/.test(item.id) ||
        !Object.hasOwn(PRECIOS, item.tipo) ||
        ids.has(item.id)
      ) {
        throw new HttpsError(
          "invalid-argument",
          "Hay un boleto inválido o repetido."
        );
      }

      ids.add(item.id);

      const codigoCupon = item.codigoCupon
        ? codigoValido(item.codigoCupon)
        : null;

      if (codigoCupon && codigos.has(codigoCupon)) {
        throw new HttpsError(
          "invalid-argument",
          "Un cupón no puede aplicarse a dos boletos."
        );
      }

      if (codigoCupon) codigos.add(codigoCupon);

      return {
        id: item.id,
        tipo: item.tipo,
        codigoCupon,
      };
    });

    const huella = createHash("sha256")
      .update(JSON.stringify({ fecha, metodo, lineas }))
      .digest("hex");

    const compraRef = db.doc(
      `usuarios/${uid}/compras/${operacionId}`
    );

    const aforoRef = db.doc(`aforos/${fecha}`);
    const perfilRef = db.doc(`usuarios/${uid}`);

    const codigosLista = [...codigos];

    const cuponRefs = codigosLista.map((codigo) =>
      db.doc(`usuarios/${uid}/cupones/${codigo}`)
    );

    // Se generan fuera del callback porque una transacción
    // puede ejecutarse varias veces por concurrencia.
    const boletosNuevos = lineas.map(() =>
      db.collection("boletos").doc(
        randomBytes(24).toString("hex")
      )
    );

    return db.runTransaction(async (tx) => {
      const compraAnterior = await tx.get(compraRef);

      if (compraAnterior.exists) {
        const anterior = compraAnterior.data();

        if (anterior.huella !== huella) {
          throw new HttpsError(
            "already-exists",
            "La operación ya se utilizó con otros datos."
          );
        }

        // Reintentar tras perder conexión no emite más boletos.
        return anterior.resultado;
      }

      if (fecha < fechaLima()) {
        throw new HttpsError(
          "failed-precondition",
          "No puedes comprar para una fecha pasada."
        );
      }

      // Todas las lecturas ocurren antes de las escrituras.
      const referencias = [
        perfilRef,
        aforoRef,
        ...cuponRefs,
      ];

      const snapshots = await tx.getAll(...referencias);

      const perfil = snapshots[0];
      const aforo = snapshots[1];

      if (!perfil.exists) {
        throw new HttpsError(
          "failed-precondition",
          "Completa tu perfil antes de comprar."
        );
      }

      const vendidos = aforo.exists
        ? aforo.data().vendidos
        : 0;

      if (
        !Number.isInteger(vendidos) ||
        vendidos < 0 ||
        vendidos > CAPACIDAD
      ) {
        throw new HttpsError(
          "failed-precondition",
          "El aforo necesita revisión administrativa."
        );
      }

      if (vendidos + lineas.length > CAPACIDAD) {
        throw new HttpsError(
          "failed-precondition",
          "Ya no hay suficientes cupos para esta fecha."
        );
      }

      const descuentos = new Map();

      codigosLista.forEach((codigo, indice) => {
        descuentos.set(
          codigo,
          validarCupon(snapshots[indice + 2], fecha)
        );
      });

      const boletos = lineas.map((linea, indice) => {
        const precio = PRECIOS[linea.tipo];

        const porcentaje = linea.codigoCupon
          ? descuentos.get(linea.codigoCupon)
          : 0;

        const descuento = Math.round(
          precio * porcentaje / 100
        );

        return {
          id: boletosNuevos[indice].id,
          uid,
          compraId: operacionId,
          fecha,
          tipo: linea.tipo,
          precio,
          porcentaje,
          descuento,
          total: precio - descuento,
          codigoCupon: linea.codigoCupon,
          estado: "activa",
        };
      });

      const subtotal = boletos.reduce(
        (suma, boleto) => suma + boleto.precio,
        0
      );

      const descuento = boletos.reduce(
        (suma, boleto) => suma + boleto.descuento,
        0
      );

      const total = subtotal - descuento;

      // Importes en céntimos. El IGV ya está incluido.
      const base = Math.round(total / 1.18);
      const igv = total - base;

      const resultado = {
        id: operacionId,
        fecha,
        fechaCompra: new Date().toISOString(),
        metodo,
        simulacion: true,
        estado: "confirmada",
        subtotal,
        descuento,
        base,
        igv,
        total,
        boletos,
      };

      tx.set(aforoRef, {
        capacidad: CAPACIDAD,
        vendidos: vendidos + boletos.length,
        updatedAt: FieldValue.serverTimestamp(),
      });

      tx.create(compraRef, {
        uid,
        huella,
        estado: "confirmada",
        resultado,
        createdAt: FieldValue.serverTimestamp(),
      });

      boletos.forEach((boleto, indice) => {
        tx.create(boletosNuevos[indice], {
          ...boleto,
          createdAt: FieldValue.serverTimestamp(),
        });
      });

      codigosLista.forEach((codigo, indice) => {
        const boleto = boletos.find(
          (item) => item.codigoCupon === codigo
        );

        tx.update(cuponRefs[indice], {
          estado: "usado",
          compraId: operacionId,
          boletoId: boleto.id,
          usedAt: FieldValue.serverTimestamp(),
        });
      });

      return resultado;
    });
  }
);

// Esta función la utilizará posteriormente el escáner del personal.
// Los roles deben asignarse con Admin SDK, nunca desde el perfil.
exports.validarBoleto = onCall(
  { region: REGION },
  async (request) => {
    const operadorUid = usuario(request);
    const rol = request.auth.token.rol;

    if (!["administrador", "operador"].includes(rol)) {
      throw new HttpsError(
        "permission-denied",
        "No tienes permiso para validar boletos."
      );
    }

    const qr = request.data?.qr;

    if (
      typeof qr !== "string" ||
      !/^INKAPARK:1:[a-f0-9]{48}$/.test(qr)
    ) {
      throw new HttpsError(
        "invalid-argument",
        "QR inválido."
      );
    }

    const boletoRef = db.doc(
      `boletos/${qr.split(":")[2]}`
    );

    return db.runTransaction(async (tx) => {
      const snapshot = await tx.get(boletoRef);

      if (!snapshot.exists) {
        throw new HttpsError(
          "not-found",
          "El boleto no existe."
        );
      }

      const boleto = snapshot.data();

      if (boleto.estado !== "activa") {
        throw new HttpsError(
          "failed-precondition",
          "El boleto ya fue utilizado o no está activo."
        );
      }

      if (boleto.fecha !== fechaLima()) {
        throw new HttpsError(
          "failed-precondition",
          "El boleto no corresponde al día de hoy."
        );
      }

      const compraRef = db.doc(
        `usuarios/${boleto.uid}/compras/${boleto.compraId}`
      );

      const compra = await tx.get(compraRef);

      if (
        !compra.exists ||
        compra.data().estado !== "confirmada"
      ) {
        throw new HttpsError(
          "failed-precondition",
          "El boleto no tiene una compra confirmada."
        );
      }

      tx.update(boletoRef, {
        estado: "usada",
        usedAt: FieldValue.serverTimestamp(),
        operadorUid,
      });

      return {
        aceptado: true,
        boletoId: snapshot.id,
        tipo: boleto.tipo,
      };
    });
  }
);