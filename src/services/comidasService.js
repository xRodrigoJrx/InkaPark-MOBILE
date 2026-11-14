import {
  collection,
  getDocsFromServer,
  query,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";

export async function obtenerComidas() {
  const consulta = query(
    collection(db, "comidas"),
    where("activo", "==", true)
  );

  const resultado = await getDocsFromServer(consulta);

  return resultado.docs
    .map((documento) => ({
      ...documento.data(),
      id: documento.id,
    }))
    .sort((a, b) => a.orden - b.orden);
}