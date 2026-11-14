export const META_CM = 32500;

export const PREMIOS = [
  {
    id: "camina10",
    nombre: "Favor del Sol",
    porcentaje: 10,
    costo: 100,
    campo: "canje10",
    codigo: "codigo10",
  },
  {
    id: "camina25",
    nombre: "Tesoro del Inca",
    porcentaje: 25,
    costo: 225,
    campo: "canje25",
    codigo: "codigo25",
  },
];

export function cuentaInicial() {
  return {
    distanciaCm: 0,
    puntosObtenidos: 0,
    gastados: 0,
    saldo: 0,
    metaCompleta: false,
    canje10: false,
    canje25: false,
    codigo10: "",
    codigo25: "",
  };
}

export function conDistancia(cuenta, cm) {
  const distanciaCm = Math.min(
    META_CM,
    Math.max(
      cuenta.distanciaCm,
      Math.floor(cm)
    )
  );

  const puntosObtenidos = Math.floor(
    distanciaCm / 100
  );

  return {
    ...cuenta,
    distanciaCm,
    puntosObtenidos,
    saldo: puntosObtenidos - cuenta.gastados,
    metaCompleta: distanciaCm === META_CM,
  };
}

export function distanciaMetros(a, b) {
  const rad = (valor) =>
    valor * Math.PI / 180;

  const dLat = rad(
    b.latitude - a.latitude
  );

  const dLon = rad(
    b.longitude - a.longitude
  );

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
    Math.cos(rad(b.latitude)) *
    Math.sin(dLon / 2) ** 2;

  return (
    6371000 *
    2 *
    Math.asin(
      Math.sqrt(Math.min(1, x))
    )
  );
}

export function tramoValido(anterior, nueva) {
  const coordenadas = nueva.coords;

  if (
    !coordenadas ||
    !Number.isFinite(coordenadas.latitude) ||
    !Number.isFinite(coordenadas.longitude) ||
    !Number.isFinite(coordenadas.accuracy) ||
    coordenadas.accuracy > 20 ||
    coordenadas.accuracy < 0
  ) {
    return {
      reiniciar: true,
      metros: 0,
    };
  }

  if (!anterior) {
    return {
      reiniciar: true,
      metros: 0,
    };
  }

  const segundos =
    (nueva.timestamp - anterior.timestamp) / 1000;

  if (segundos <= 0) {
    return {
      reiniciar: false,
      metros: 0,
    };
  }

  if (segundos > 30) {
    return {
      reiniciar: true,
      metros: 0,
    };
  }

  const metros = distanciaMetros(
    anterior.coords,
    coordenadas
  );

  // Aproximadamente 10 km/h.
  // Los saltos superiores no se acreditan.
  if (
    metros / segundos > 2.8 ||
    (
      Number.isFinite(coordenadas.speed) &&
      coordenadas.speed > 2.8
    )
  ) {
    return {
      reiniciar: true,
      metros: 0,
    };
  }

  // Evita sumar continuamente pequeñas oscilaciones.
  if (metros < 4) {
    return {
      reiniciar: false,
      metros: 0,
    };
  }

  return {
    reiniciar: false,
    metros,
  };
}