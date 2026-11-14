const fs = require("node:fs/promises");
const path = require("node:path");

const {
  initializeApp,
  applicationDefault,
} = require("firebase-admin/app");

const {
  getFirestore,
  FieldValue,
} = require("firebase-admin/firestore");

async function main() {
  const ejecutar = process.argv.includes("--ejecutar");

  const archivo = path.resolve(
    __dirname,
    "../../src/data/atracciones.json"
  );

  const atracciones = JSON.parse(
    await fs.readFile(archivo, "utf8")
  );

  if (!Array.isArray(atracciones) || atracciones.length === 0) {
    throw new Error("El JSON debe contener una lista de atracciones.");
  }

  const ids = new Set();

  const documentos = atracciones.map((atraccion, indice) => {
    if (
      !atraccion ||
      !Number.isInteger(atraccion.id) ||
      typeof atraccion.nombre !== "string"
    ) {
      throw new Error(`Atracción inválida en la posición ${indice}.`);
    }

    const { id, ...campos } = atraccion;
    const documentoId = `atraccion-${id}`;

    if (ids.has(documentoId)) {
      throw new Error(`Identificador repetido: ${documentoId}`);
    }

    ids.add(documentoId);

    return {
      ruta: `atracciones/${documentoId}`,
      datos: {
        ...campos,
        activo: true,
        orden: indice + 1,
      },
    };
  });

  console.log("PROYECTO: inkapark-ce3d4");

  for (const documento of documentos) {
    console.log(documento.ruta);
  }

  if (!ejecutar) {
    console.log("SIMULACIÓN: no se escribió en Firebase.");
    console.log("Para importar: node importar.cjs --ejecutar");
    return;
  }

  if (documentos.length > 500) {
    throw new Error("Este script admite hasta 500 documentos.");
  }

  initializeApp({
    credential: applicationDefault(),
    projectId: "inkapark-ce3d4",
  });

  const db = getFirestore();
  const lote = db.batch();

  for (const documento of documentos) {
    lote.create(db.doc(documento.ruta), {
      ...documento.datos,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await lote.commit();

  console.log(
    `IMPORTACIÓN CONFIRMADA: ${documentos.length} documentos creados.`
  );
}

main().catch((error) => {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
});