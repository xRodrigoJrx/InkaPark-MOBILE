export function mensajeAuth(error) {
  switch (error?.code) {
    case "auth/invalid-email":
      return "Ingresa un correo válido.";

    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/user-disabled":
      return (
        "No se pudo iniciar sesión. " +
        "Revisa tus datos o recupera la contraseña."
      );

    case "auth/email-already-in-use":
      return (
        "No se pudo registrar ese correo. " +
        "Intenta iniciar sesión o recuperar la contraseña."
      );

    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return (
        "La contraseña no cumple la política " +
        "de seguridad del proyecto."
      );

    case "auth/network-request-failed":
    case "unavailable":
    case "deadline-exceeded":
      return (
        "No se pudo conectar. " +
        "Comprueba Internet y vuelve a intentarlo."
      );

    case "auth/too-many-requests":
      return (
        "Demasiados intentos. " +
        "Espera unos minutos antes de volver a probar."
      );

    case "auth/operation-not-allowed":
      return (
        "El acceso con correo y contraseña " +
        "no está habilitado en Firebase."
      );

    case "permission-denied":
      return (
        "No se pudo acceder al perfil. " +
        "Revisa las reglas de usuarios en Firestore."
      );

    default:
      return (
        "No se pudo completar la operación. " +
        "Inténtalo nuevamente."
      );
  }
}