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
    "../../src/data/espectaculos.json"
  );

  const espectaculos = JSON.parse(
    await fs.readFile(archivo, "utf8")
  );

  if (!Array.isArray(espectaculos) || espectaculos.length === 0) {
    throw new Error("El JSON debe contener una lista de espectáculos.");
  }

  const ids = new Set();

  const documentos = espectaculos.map((espectaculo, indice) => {
    if (
      !espectaculo ||
      !Number.isInteger(espectaculo.id) ||
      typeof espectaculo.nombre !== "string" ||
      !Array.isArray(espectaculo.horarios) ||
      !espectaculo.horarios.every(
        (horario) => typeof horario === "string"
      )
    ) {
      throw new Error(
        `Espectáculo inválido en la posición ${indice}. Revisa id, nombre y horarios.`
      );
    }

    const { id, ...campos } = espectaculo;
    const documentoId = `espectaculo-${id}`;

    if (ids.has(documentoId)) {
      throw new Error(`Identificador repetido: ${documentoId}`);
    }

    ids.add(documentoId);

    return {
      ruta: `espectaculos/${documentoId}`,
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

  console.log(`Total: ${documentos.length} documentos preparados.`);

  if (!ejecutar) {
    console.log("SIMULACIÓN: no se escribió en Firebase.");
    console.log(
      "Para importar: node importar-espectaculos.cjs --ejecutar"
    );
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
    `IMPORTACIÓN CONFIRMADA: ${documentos.length} espectáculos creados.`
  );
}

main().catch((error) => {
  console.error("ERROR:", error.message);
  process.exitCode = 1;
});