export function hoyPeru() {
  const partes = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Lima",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(new Date());

  const valor = (tipo) =>
    partes.find(
      (parte) => parte.type === tipo
    ).value;

  return (
    `${valor("year")}-` +
    `${valor("month")}-` +
    valor("day")
  );
}

export function instantePeru(fecha, hora) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha || "") ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora || "")
  ) {
    throw new Error(
      "Selecciona una fecha y hora válidas."
    );
  }

  const dia = new Date(
    `${fecha}T12:00:00Z`
  );

  if (
    Number.isNaN(dia.getTime()) ||
    dia.toISOString().slice(0, 10) !== fecha
  ) {
    throw new Error(
      "La fecha no es válida."
    );
  }

  return new Date(
    `${fecha}T${hora}:00-05:00`
  ).getTime();
}

export function fechasRecordatorio(
  configuracion,
  ahora = Date.now()
) {
  const c = configuracion;

  if (
    ![
      "visita",
      "espectaculo",
      "agua",
    ].includes(c.tipo)
  ) {
    throw new Error(
      "Selecciona un tipo de recordatorio."
    );
  }

  if (c.tipo !== "agua") {
    if (
      ![0, 10, 30, 60].includes(c.antes)
    ) {
      throw new Error(
        "Selecciona cuánto antes quieres recibir el aviso."
      );
    }

    const aviso =
      instantePeru(c.fecha, c.hora) -
      c.antes * 60000;

    if (aviso <= ahora + 5000) {
      throw new Error(
        "La hora del aviso ya pasó o está demasiado cerca. Elige otra hora."
      );
    }

    return [aviso];
  }

  if (
    ![15, 30, 60].includes(c.intervalo)
  ) {
    throw new Error(
      "Selecciona la frecuencia de hidratación."
    );
  }

  const inicio = instantePeru(
    c.fecha,
    c.hora
  );

  const fin = instantePeru(
    c.fecha,
    c.fin
  );

  if (fin <= inicio) {
    throw new Error(
      "La hora final debe ser posterior al primer aviso."
    );
  }

  const fechas = [];

  for (
    let instante = inicio;
    instante <= fin;
    instante += c.intervalo * 60000
  ) {
    if (instante > ahora + 5000) {
      fechas.push(instante);
    }

    if (fechas.length > 24) {
      throw new Error(
        "Elige una franja más corta: máximo 24 avisos de hidratación."
      );
    }
  }

  if (!fechas.length) {
    throw new Error(
      "No quedan horas futuras en esa franja."
    );
  }

  return fechas;
}

export function claveRecordatorio(c) {
  return JSON.stringify([
    c.tipo,
    c.boletoId || "",
    c.espectaculoId || "",
    c.fecha,
    c.hora,
    c.antes || 0,
    c.fin || "",
    c.intervalo || 0,
  ]);
}