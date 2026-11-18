const IMAGENES = {
  "LOMO SALTADO": require("../../assets/lomo.saltado.webp"),
  "AJÍ DE GALLINA": require("../../assets/aji;gallina.avif"),
  "CAUSA LIMEÑA": require("../../assets/causa.limena.webp"),
  "CHICHA MORADA": require("../../assets/chicha.jpg"),
  "PICARONES": require("../../assets/picarones.webp"),
  "ANTICUCHOS": require("../../assets/anticucho.jpg"),
};

const IMAGEN_DEFECTO = require("../../assets/Comida.webp");

export function obtenerImagenComida(comida) {
  if (!comida || typeof comida.nombre !== "string") {
    return IMAGEN_DEFECTO;
  }

  return IMAGENES[comida.nombre] || IMAGEN_DEFECTO;
}
