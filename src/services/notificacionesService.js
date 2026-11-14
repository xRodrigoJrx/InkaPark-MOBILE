import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Crypto from "expo-crypto";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import {
  doc,
  getDocFromServer,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

import {
  fechasRecordatorio,
  claveRecordatorio,
  hoyPeru,
} from "../utils/recordatoriosCore";

const claveCuenta = (uid) =>
  `@inkapark/avisos/v1/${uid}`;

const REGISTRO_CUENTAS =
  "@inkapark/avisos/cuentas/v1";

let cola = Promise.resolve();

function turno(accion) {
  const trabajo = cola
    .catch(() => {})
    .then(accion);

  cola = trabajo.catch(() => {});

  return trabajo;
}

function verificarUsuario(uid) {
  if (
    !uid ||
    auth.currentUser?.uid !== uid ||
    auth.currentUser.isAnonymous
  ) {
    throw new Error(
      "Inicia sesión nuevamente para continuar."
    );
  }
}

async function leer(uid) {
  const texto =
    await AsyncStorage.getItem(
      claveCuenta(uid)
    );

  if (!texto) {
    return {
      planes: [],
      historial: [],
    };
  }

  const datos = JSON.parse(texto);

  if (
    !Array.isArray(datos.planes) ||
    !Array.isArray(datos.historial)
  ) {
    throw new Error(
      "No se pudo recuperar la información de recordatorios."
    );
  }

  return datos;
}

async function guardar(uid, datos) {
  const cuentas = JSON.parse(
    await AsyncStorage.getItem(
      REGISTRO_CUENTAS
    ) || "[]"
  );

  if (!cuentas.includes(uid)) {
    await AsyncStorage.setItem(
      REGISTRO_CUENTAS,
      JSON.stringify([
        ...cuentas,
        uid,
      ])
    );
  }

  await AsyncStorage.setItem(
    claveCuenta(uid),
    JSON.stringify(datos)
  );
}

function agregarEvento(
  datos,
  accion,
  titulo,
  unico = null
) {
  if (
    unico &&
    datos.historial.some(
      (evento) => evento.unico === unico
    )
  ) {
    return;
  }

  datos.historial = [
    {
      id: Crypto.randomUUID(),
      accion,
      titulo,
      fecha: Date.now(),
      unico,
    },
    ...datos.historial,
  ].slice(0, 100);
}

export function avisoPropio(notificacion) {
  return (
    notificacion?.request?.content?.data
      ?.inkaAviso === true
  );
}

Notifications.setNotificationHandler({
  handleNotification: async (notificacion) => {
    const mostrar =
      avisoPropio(notificacion) &&
      notificacion.request.content.data.uid ===
        auth.currentUser?.uid;

    return {
      shouldShowBanner: mostrar,
      shouldShowList: mostrar,
      shouldPlaySound: mostrar,
      shouldSetBadge: false,
    };
  },
});

export async function consultarPermisoAvisos() {
  return Notifications.getPermissionsAsync();
}

async function prepararCanal() {
  if (Platform.OS !== "android") {
    return null;
  }

  try {
    await Notifications
      .setNotificationChannelAsync(
        "inkapark-recordatorios",
        {
          name: "Recordatorios de InkaPark",
          importance:
            Notifications.AndroidImportance.DEFAULT,
          sound: "default",
          vibrationPattern: [
            0, 180, 100, 180,
          ],
        }
      );

    return "inkapark-recordatorios";
  } catch {
    // Expo Go puede utilizar el canal de respaldo.
    return null;
  }
}

export async function solicitarPermisoAvisos() {
  await prepararCanal();

  let permiso =
    await Notifications.getPermissionsAsync();

  if (
    !permiso.granted &&
    permiso.canAskAgain
  ) {
    permiso =
      await Notifications
        .requestPermissionsAsync();
  }

  return permiso;
}

async function validarDestino(uid, c) {
  verificarUsuario(uid);

  if (c.tipo === "visita") {
    const snapshot =
      await getDocFromServer(
        doc(
          db,
          "boletos",
          c.boletoId
        )
      );

    if (
      !snapshot.exists() ||
      snapshot.data().uid !== uid ||
      snapshot.data().estado !== "activa" ||
      snapshot.data().fecha < hoyPeru()
    ) {
      throw new Error(
        "El boleto no está disponible para programar una visita."
      );
    }

    if (
      snapshot.data().fecha !== c.fecha
    ) {
      throw new Error(
        "La fecha debe coincidir con tu boleto."
      );
    }

    return {
      titulo: "Tu visita a InkaPark",
      cuerpo:
        `Tu aventura comienza a las ${c.hora}. ` +
        "Ten tu boleto a mano.",
    };
  }

  if (c.tipo === "espectaculo") {
    const snapshot =
      await getDocFromServer(
        doc(
          db,
          "espectaculos",
          c.espectaculoId
        )
      );

    if (
      !snapshot.exists() ||
      snapshot.data().activo !== true ||
      !Array.isArray(
        snapshot.data().horarios
      ) ||
      !snapshot.data().horarios.includes(
        c.hora
      )
    ) {
      throw new Error(
        "Ese espectáculo u horario ya no está disponible."
      );
    }

    return {
      titulo: snapshot.data().nombre,
      cuerpo:
        `Comienza a las ${c.hora}. ` +
        "Prepárate para disfrutar el espectáculo.",
    };
  }

  return {
    titulo: "Una pausa para hidratarte",
    cuerpo:
      "Toma un poco de agua y continúa disfrutando de InkaPark.",
  };
}

export function programarRecordatorio(
  uid,
  entrada
) {
  return turno(async () => {
    verificarUsuario(uid);

    const configuracion = {
      tipo: entrada.tipo,
      fecha: entrada.fecha,
      hora: entrada.hora,
      antes: entrada.antes,
      boletoId: entrada.boletoId || "",
      espectaculoId:
        entrada.espectaculoId || "",
      fin: entrada.fin || "",
      intervalo: entrada.intervalo || 0,
    };

    const contenido =
      await validarDestino(
        uid,
        configuracion
      );

    const fechas =
      fechasRecordatorio(
        configuracion
      );

    const datos = await leer(uid);

    const pendientes =
      await Notifications
        .getAllScheduledNotificationsAsync();

    const identificadores = new Set(
      pendientes.map(
        (aviso) => aviso.identifier
      )
    );

    const clave =
      claveRecordatorio(
        configuracion
      );

    const duplicado =
      datos.planes.some(
        (plan) =>
          plan.clave === clave &&
          plan.ids.some(
            (id) =>
              identificadores.has(id)
          )
      );

    if (duplicado) {
      throw new Error(
        "Ese recordatorio ya está programado."
      );
    }

    if (
      pendientes.length +
      fechas.length > 40
    ) {
      throw new Error(
        "Hay demasiados avisos pendientes. Cancela algunos antes de agregar más."
      );
    }

    const permiso =
      await solicitarPermisoAvisos();

    if (!permiso.granted) {
      throw new Error(
        permiso.canAskAgain
          ? "Permite las notificaciones para recibir tus recordatorios."
          : "Activa las notificaciones en Ajustes."
      );
    }

    verificarUsuario(uid);

    const channelId =
      await prepararCanal();

    const planId =
      Crypto.randomUUID();

    const plan = {
      id: planId,
      clave,
      config: configuracion,
      titulo: contenido.titulo,
      estado: "preparando",
      fechas,
      ids: fechas.map(
        (_, indice) =>
          `${planId}-${indice}`
      ),
    };

    datos.planes.push(plan);

    await guardar(uid, datos);

    try {
      for (
        let indice = 0;
        indice < fechas.length;
        indice += 1
      ) {
        verificarUsuario(uid);

        if (
          fechas[indice] <=
          Date.now() + 1000
        ) {
          throw new Error(
            "La hora seleccionada está demasiado cerca. Elige otra."
          );
        }

        await Notifications
          .scheduleNotificationAsync({
            identifier: plan.ids[indice],

            content: {
              title: contenido.titulo,
              body: contenido.cuerpo,
              sound: "default",

              data: {
                inkaAviso: true,
                uid,
                planId,
                tipo: configuracion.tipo,
                boletoId:
                  configuracion.boletoId,
                espectaculoId:
                  configuracion.espectaculoId,
              },
            },

            trigger: {
              type:
                Notifications
                  .SchedulableTriggerInputTypes
                  .DATE,

              date: new Date(
                fechas[indice]
              ),

              ...(channelId
                ? { channelId }
                : {}),
            },
          });
      }

      verificarUsuario(uid);

      plan.estado = "activo";

      agregarEvento(
        datos,
        "Programado",
        plan.titulo
      );

      await guardar(uid, datos);

      return plan;
    } catch (error) {
      const cancelaciones =
        await Promise.allSettled(
          plan.ids.map(
            (id) =>
              Notifications
                .cancelScheduledNotificationAsync(
                  id
                )
          )
        );

      plan.estado =
        cancelaciones.some(
          (resultado) =>
            resultado.status === "rejected"
        )
          ? "revisar"
          : "interrumpido";

      await guardar(uid, datos);

      throw new Error(
        plan.estado === "revisar"
          ? "No se completó la programación. Revisa los avisos pendientes antes de continuar."
          : error.message ||
            "No se pudo programar el recordatorio."
      );
    }
  });
}

export function obtenerRecordatorios(uid) {
  return turno(async () => {
    verificarUsuario(uid);

    const datos = await leer(uid);

    const pendientes =
      await Notifications
        .getAllScheduledNotificationsAsync();

    const identificadores = new Set(
      pendientes.map(
        (aviso) => aviso.identifier
      )
    );

    let cambio = false;

    for (const plan of datos.planes) {
      if (
        plan.estado === "preparando" ||
        plan.estado === "revisar"
      ) {
        await Promise.all(
          plan.ids.map(
            (id) =>
              Notifications
                .cancelScheduledNotificationAsync(
                  id
                )
          )
        );

        plan.estado = "interrumpido";

        agregarEvento(
          datos,
          "Programación interrumpida",
          plan.titulo
        );

        cambio = true;
      } else if (
        plan.estado === "activo" &&
        !plan.ids.some(
          (id) =>
            identificadores.has(id)
        )
      ) {
        plan.estado =
          Math.max(...plan.fechas) <
          Date.now()
            ? "finalizado"
            : "interrumpido";

        agregarEvento(
          datos,
          plan.estado === "finalizado"
            ? "Horario finalizado"
            : "Programación interrumpida",
          plan.titulo
        );

        cambio = true;
      }
    }

    if (cambio) {
      await guardar(uid, datos);
    }

    return {
      planes: datos.planes.map(
        (plan) => ({
          ...plan,

          proxima:
            plan.fechas.find(
              (_, indice) =>
                identificadores.has(
                  plan.ids[indice]
                )
            ) || null,
        })
      ),

      historial: datos.historial,
    };
  });
}

export function cancelarRecordatorio(
  uid,
  planId
) {
  return turno(async () => {
    verificarUsuario(uid);

    const datos = await leer(uid);

    const plan = datos.planes.find(
      (item) => item.id === planId
    );

    if (!plan) return;

    await Promise.all(
      plan.ids.map(
        (id) =>
          Notifications
            .cancelScheduledNotificationAsync(
              id
            )
      )
    );

    plan.estado = "cancelado";

    agregarEvento(
      datos,
      "Cancelado",
      plan.titulo
    );

    await guardar(uid, datos);
  });
}

async function suspenderSinCola(uid) {
  const datos = await leer(uid);

  const pendientes =
    await Notifications
      .getAllScheduledNotificationsAsync();

  const propios = pendientes.filter(
    (aviso) =>
      aviso.content.data?.inkaAviso ===
        true &&
      aviso.content.data.uid === uid
  );

  const identificadores = new Set([
    ...propios.map(
      (aviso) => aviso.identifier
    ),

    ...datos.planes
      .filter(
        (plan) =>
          [
            "activo",
            "preparando",
            "revisar",
          ].includes(plan.estado)
      )
      .flatMap((plan) => plan.ids),
  ]);

  await Promise.all(
    [...identificadores].map(
      (id) =>
        Notifications
          .cancelScheduledNotificationAsync(
            id
          )
    )
  );

  const visibles =
    await Notifications
      .getPresentedNotificationsAsync();

  await Promise.all(
    visibles
      .filter(
        (notificacion) =>
          avisoPropio(notificacion) &&
          notificacion.request.content
            .data.uid === uid
      )
      .map(
        (notificacion) =>
          Notifications
            .dismissNotificationAsync(
              notificacion.request.identifier
            )
      )
  );

  for (const plan of datos.planes) {
    if (
      [
        "activo",
        "preparando",
        "revisar",
      ].includes(plan.estado)
    ) {
      plan.estado = "suspendido";

      agregarEvento(
        datos,
        "Pausado",
        plan.titulo
      );
    }
  }

  await guardar(uid, datos);
}

export function suspenderAvisos(uid) {
  return turno(() =>
    suspenderSinCola(uid)
  );
}

export function limpiarAvisosAjenos() {
  return turno(async () => {
    const actual =
      auth.currentUser?.uid;

    const cuentas = JSON.parse(
      await AsyncStorage.getItem(
        REGISTRO_CUENTAS
      ) || "[]"
    );

    const pendientes =
      await Notifications
        .getAllScheduledNotificationsAsync();

    const ajenos = new Set(
      [
        ...cuentas,

        ...pendientes
          .filter(
            (aviso) =>
              aviso.content.data
                ?.inkaAviso === true
          )
          .map(
            (aviso) =>
              aviso.content.data.uid
          ),
      ].filter(
        (uid) =>
          uid && uid !== actual
      )
    );

    for (const uid of ajenos) {
      await suspenderSinCola(uid);
    }
  });
}

export function cancelarTodos(uid) {
  return turno(async () => {
    verificarUsuario(uid);
    await suspenderSinCola(uid);
  });
}

export function limpiarHistorial(uid) {
  return turno(async () => {
    verificarUsuario(uid);

    const datos = await leer(uid);
    datos.historial = [];

    await guardar(uid, datos);
  });
}

export async function reactivarRecordatorio(
  uid,
  planId
) {
  verificarUsuario(uid);

  const datos = await leer(uid);

  const plan = datos.planes.find(
    (item) => item.id === planId
  );

  if (!plan) {
    throw new Error(
      "No se encontró el recordatorio."
    );
  }

  return programarRecordatorio(
    uid,
    plan.config
  );
}

export function registrarEvento(
  uid,
  accion,
  notificacion
) {
  return turno(async () => {
    if (
      auth.currentUser?.uid !== uid ||
      !avisoPropio(notificacion)
    ) {
      return;
    }

    const datos = await leer(uid);

    agregarEvento(
      datos,
      accion,

      notificacion.request.content.title ||
        "Recordatorio",

      `${accion}:` +
        notificacion.request.identifier
    );

    await guardar(uid, datos);
  });
}