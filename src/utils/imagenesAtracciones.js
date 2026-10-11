// src/utils/imagenesAtracciones.js

export function imagenPorCategoria(categoria) {
  switch (categoria) {
    case "Aventura":
    case "Naturaleza":
    case "Cultura":
    default:
      return require("../../assets/inicio.png");
  }
}