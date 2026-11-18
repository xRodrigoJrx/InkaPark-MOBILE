const IMAGENES = {
  "DANZA DEL SOL": require("../../assets/Danza al Sol Inka.png"),
  "DANZA AL SOL": require("../../assets/Danza al Sol Inka.png"),
  "LEYENDA DEL JAGUAR": require("../../assets/Leyenda del Jaguar Inka.png"),
  "MÚSICA ANDINA EN VIVO": require("../../assets/Musica Andina en vivo.png"),
  "MUSICA ANDINA EN VIVO": require("../../assets/Musica Andina en vivo.png"),
  "CEREMONIA DEL FUEGO": require("../../assets/Ceremonia al Fuego Inka.png"),
  "CEREMONIA AL FUEGO": require("../../assets/Ceremonia al Fuego Inka.png"),
};

const IMAGEN_DEFECTO = require("../../assets/Espectaculo.jpg");

export function obtenerImagenEspectaculo(espectaculo) {
  if (!espectaculo || typeof espectaculo.nombre !== "string") {
    return IMAGEN_DEFECTO;
  }

  const nombre = espectaculo.nombre.trim().toUpperCase();

  return IMAGENES[nombre] || IMAGEN_DEFECTO;
}
