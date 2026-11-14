import {
  useEffect,
  useState,
} from "react";

import {
  getIdTokenResult,
  onIdTokenChanged,
} from "firebase/auth";

import { auth } from "../config/firebase";

export function useRol(uid) {
  const [estado, setEstado] = useState({
    uid: null,
    rol: null,
    cargando: true,
    error: "",
  });

  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let activo = true;
    let version = 0;

    setEstado({
      uid: uid || null,
      rol: null,
      cargando: !!uid,
      error: "",
    });

    const cancelar = onIdTokenChanged(
      auth,
      async (usuario) => {
        const actual = ++version;

        if (!uid || usuario?.uid !== uid) {
          if (activo) {
            setEstado({
              uid: uid || null,
              rol: null,
              cargando: !!uid,
              error: "",
            });
          }
          return;
        }

        try {
          const token = await getIdTokenResult(
            usuario
          );

          const claim = token.claims.rol;

          if (
            claim != null &&
            ![
              "administrador",
              "operador",
            ].includes(claim)
          ) {
            throw new Error(
              "El rol de esta cuenta no está configurado correctamente."
            );
          }

          if (
            !activo ||
            actual !== version ||
            auth.currentUser?.uid !== uid
          ) {
            return;
          }

          setEstado({
            uid,
            rol: claim || "visitante",
            cargando: false,
            error: "",
          });
        } catch {
          if (
            !activo ||
            actual !== version
          ) {
            return;
          }

          setEstado({
            uid,
            rol: null,
            cargando: false,
            error:
              "No pudimos comprobar el acceso de esta cuenta.",
          });
        }
      }
    );

    return () => {
      activo = false;
      version += 1;
      cancelar();
    };
  }, [uid, intento]);

  if (uid && estado.uid !== uid) {
    return {
      rol: null,
      cargando: true,
      error: "",
      reintentar: () =>
        setIntento((valor) => valor + 1),
    };
  }

  return {
    ...estado,
    reintentar: () =>
      setIntento((valor) => valor + 1),
  };
}