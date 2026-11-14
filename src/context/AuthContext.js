// src/context/AuthContext.js

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";
import { crearPerfilSiFalta } from "../services/usuariosService";
import { mensajeAuth } from "../utils/authErrors";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [cuenta, setCuenta] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  const [errorPerfil, setErrorPerfil] = useState("");
  const [errorSesion, setErrorSesion] = useState("");

  const [registrando, setRegistrando] = useState(false);
  const [datosPendientes, setDatosPendientes] = useState(null);
  const [avisoPerfil, setAvisoPerfil] = useState("");

  const [intentoPerfil, setIntentoPerfil] = useState(0);
  const [intentoAuth, setIntentoAuth] = useState(0);

  const registroEnCurso = useRef(false);

  // Firebase restaura la sesión guardada y notifica los cambios.
  useEffect(() => {
    setCargandoAuth(true);
    setErrorSesion("");

    const cancelar = onAuthStateChanged(
      auth,
      (actual) => {
        // Anonymous no se considera una sesión definitiva.
        const definitiva =
          actual && !actual.isAnonymous ? actual : null;

        setCuenta(definitiva);
        setUsuario(null);
        setErrorPerfil("");
        setCargandoPerfil(Boolean(definitiva));
        setCargandoAuth(false);

        if (!definitiva && !registroEnCurso.current) {
          setDatosPendientes(null);
          setAvisoPerfil("");
        }
      },
      () => {
        setCuenta(null);
        setUsuario(null);
        setCargandoAuth(false);
        setCargandoPerfil(false);

        setErrorSesion(
          "No se pudo restaurar la sesión. Intenta nuevamente."
        );
      }
    );

    return cancelar;
  }, [intentoAuth]);

  const uid = cuenta?.uid;

  // Escucha únicamente el perfil del usuario autenticado.
  useEffect(() => {
    if (!uid) {
      return;
    }

    let activo = true;

    setCargandoPerfil(true);
    setErrorPerfil("");

    const referencia = doc(db, "usuarios", uid);

    const cancelar = onSnapshot(
      referencia,
      (documento) => {
        if (!activo) {
          return;
        }

        setUsuario(
          documento.exists()
            ? {
                ...documento.data(),
                uid: documento.id,
              }
            : null
        );

        setErrorPerfil("");
        setCargandoPerfil(false);
      },
      (error) => {
        if (!activo) {
          return;
        }

        setUsuario(null);
        setErrorPerfil(mensajeAuth(error));
        setCargandoPerfil(false);
      }
    );

    return () => {
      activo = false;
      cancelar();
    };
  }, [uid, intentoPerfil]);

  async function registrar({
    nombre,
    correo,
    telefono,
    contrasena,
  }) {
    if (registroEnCurso.current) {
      return;
    }

    registroEnCurso.current = true;

    setDatosPendientes({
      nombre: nombre.trim(),
      telefono,
    });

    setAvisoPerfil("");
    setRegistrando(true);

    try {
      const credencial =
        await createUserWithEmailAndPassword(
          auth,
          correo.trim().toLowerCase(),
          contrasena
        );

      // Crear la cuenta también inicia sesión en Firebase.
      // La contraseña nunca se envía al servicio de perfiles.
      try {
        await crearPerfilSiFalta(credencial.user, {
          nombre,
          telefono,
        });

        setDatosPendientes(null);
      } catch (error) {
        // La cuenta ya existe aunque falle Firestore.
        // AppStack mostrará la recuperación del perfil pendiente.
        setAvisoPerfil(
          "Tu cuenta ya fue creada. Falta guardar el perfil: " +
            mensajeAuth(error)
        );
      }
    } catch (error) {
      setDatosPendientes(null);
      throw error;
    } finally {
      registroEnCurso.current = false;
      setRegistrando(false);
    }
  }

  async function ingresar(correo, contrasena) {
    setDatosPendientes(null);
    setAvisoPerfil("");

    await signInWithEmailAndPassword(
      auth,
      correo.trim().toLowerCase(),
      contrasena
    );
  }

  async function recuperar(correo) {
    try {
      await sendPasswordResetEmail(
        auth,
        correo.trim().toLowerCase()
      );
    } catch (error) {
      // Mantener una respuesta neutral para correos inexistentes.
      if (error.code !== "auth/user-not-found") {
        throw error;
      }
    }
  }

  async function completarPerfil(datos) {
    const actual = auth.currentUser;

    if (
      !actual ||
      actual.isAnonymous ||
      actual.uid !== uid
    ) {
      throw new Error(
        "La sesión cambió. Vuelve a iniciar sesión."
      );
    }

    await crearPerfilSiFalta(actual, datos);

    setDatosPendientes(null);
    setAvisoPerfil("");
    setIntentoPerfil((valor) => valor + 1);
  }

  async function salir() {
    await signOut(auth);

    setUsuario(null);
    setDatosPendientes(null);
    setAvisoPerfil("");
  }

  function reintentarPerfil() {
    setIntentoPerfil((valor) => valor + 1);
  }

  function reintentarSesion() {
    setIntentoAuth((valor) => valor + 1);
  }

  return (
    <AuthContext.Provider
      value={{
        cuenta,
        usuario,
        cargandoAuth,
        cargandoPerfil,
        errorPerfil,
        errorSesion,
        registrando,
        datosPendientes,
        avisoPerfil,
        registrar,
        ingresar,
        recuperar,
        completarPerfil,
        salir,
        reintentarPerfil,
        reintentarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);

  if (!contexto) {
    throw new Error("useAuth necesita AuthProvider.");
  }

  return contexto;
}