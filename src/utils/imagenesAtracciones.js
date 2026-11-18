const IMAGENES = {
  "MONTAÑA INCA": require("../../assets/Mntana Inka.png"),
  "SHOW CULTURAL": require("../../assets/Show Cultural Inka.png"),
  "RÍO SAGRADO": require("../../assets/Rio Sagrado Inka.png"),
  "COLISEO ANDINO": require("../../assets/Coliseo Inka.png"),
  "MERCADO ANDINO": require("../../assets/Mercado Inka.png"),
};

const IMAGEN_DEFECTO = require("../../assets/medio.png");

export function obtenerImagenAtraccion(atraccion) {
  if (!atraccion || typeof atraccion.nombre !== "string") {
    return IMAGEN_DEFECTO;
  }

  const nombre = atraccion.nombre.trim().toUpperCase();

  return IMAGENES[nombre] || IMAGEN_DEFECTO;
}
