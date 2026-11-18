# InkaPark Mobile — Avance 3: Firebase y funcionalidades móviles

Aplicación desarrollada con **Expo y React Native** para explorar un parque temático inspirado en la cultura inca. Permite crear una cuenta, consultar el catálogo del parque, simular la compra de entradas, mostrar boletos con código QR y participar en la misión **Camina y Gana**.

Este README describe la rama **`main`**.

## Objetivos del avance

- Integrar **Firebase Authentication** para el registro, el inicio de sesión y la recuperación de contraseña.
- Consultar en **Cloud Firestore** los catálogos de atracciones, espectáculos y gastronomía.
- Implementar compras simuladas, descuentos y boletos digitales con QR.
- Habilitar un panel de personal para validar boletos mediante la cámara.
- Registrar el progreso de **Camina y Gana** y canjear puntos por cupones.
- Programar recordatorios locales y generar un APK de Android con **Expo EAS Build**.

## Tecnologías y dependencias principales

| Tecnología | Versión declarada | Uso en el proyecto |
| --- | --- | --- |
| Expo | `~58.0.26` | SDK 58 y herramientas de desarrollo y empaquetado. |
| React / React Native | `19.3.0` / `0.88.1` | Componentes, hooks e interfaz multiplataforma. |
| React Navigation | `^7.5.0` / `^7.20.0` | Navegación principal, pilas de pantallas y pestañas inferiores. |
| React Native Paper | `^5.15.3` | Componentes de interfaz y tema visual. |
| React Native Web | `^0.21.4` | Ejecución de la aplicación en el navegador. |
| Expo Linear Gradient / Expo Vector Icons | `~58.0.4` / `^15.0.2` | Degradados e iconos de la interfaz. |
| Firebase JS SDK | `^13.3.0` | Autenticación y acceso a Firestore desde la aplicación. |
| AsyncStorage | `2.2.0` | Persistencia de la sesión móvil y recuperación de validaciones pendientes. |
| Expo Camera | `~58.0.14` | Escaneo de QR desde el panel de personal. |
| React Native QR Code SVG / React Native SVG | `^6.3.54` / `15.16.0` | Generación y renderizado de códigos QR. |
| Expo Print | `~58.0.9` | Apertura del diálogo de impresión del boleto. |
| Expo Crypto | `~58.0.8` | Generación de identificadores para operaciones y recordatorios. |
| Expo Location / Expo Sensors | `~58.0.22` / `~58.0.5` | Registro de distancia mediante ubicación y conteo de pasos cuando hay podómetro disponible. |
| Expo Notifications / DateTimePicker | `~58.1.9` / `9.2.1` | Programación de avisos locales y selección de fecha y hora. |
| Firebase Functions SDK | `^6.0.0` | Funciones de servidor para cupones, compras y validación de boletos. |
| Firebase Admin SDK | `^13.0.0` en Functions y `^14.5.1` en importación | Acceso a Firestore desde el servidor y carga de catálogos. |
| Expo EAS Build | Perfil `preview` | Generación del APK de Android para distribución interna. |

Los archivos `package.json` declaran las dependencias de cada componente. Los archivos `package-lock.json` fijan las versiones que instala `npm ci`.

## Requisitos

- **Git**, **npm** y **Node.js**. Para Expo, usa Node 22.13+ dentro de la rama 22 o Node 24.3+ dentro de la rama 24. Para trabajar en `functions/`, usa Node.js **22**, según su configuración.
- Un navegador para la versión web o un dispositivo compatible para la versión móvil.
- Conexión a Internet y acceso al proyecto Firebase configurado para usar el registro, los catálogos y las operaciones con boletos.
- Una cuenta Expo con acceso al proyecto EAS para generar y firmar un APK.

Comprueba las herramientas antes de instalar:

```bash
git --version
node --version
npm --version
```

## Instalación y ejecución paso a paso

### 1. Clonar el repositorio

```bash
git clone --branch main https://github.com/xRodrigoJrx/InkaPark-MOBILE.git
cd InkaPark-MOBILE
```

Si ya tienes el repositorio clonado, ejecuta desde su carpeta:

```bash
git switch main
git pull --ff-only origin main
```

### 2. Instalar y ejecutar el frontend

Desde la raíz del repositorio:

```bash
npm ci
npm start
```

- **Web** · Presiona `w` en la terminal de Expo o ejecuta `npm run web` en lugar de `npm start`.
- **Android** · Abre el QR de Metro con una versión de Expo Go compatible con SDK 58, o instala el APK generado mediante EAS. Con un emulador Android configurado, puedes ejecutar `npm run android`.
- **iOS** · Con macOS y Xcode puedes ejecutar `npm run ios` para abrir el simulador. En iPhone puedes usar Expo Go si admite SDK 58 y las funciones que quieres probar.

Prueba la cámara, el podómetro, el GPS y los recordatorios en un dispositivo físico. Concede los permisos que la aplicación solicita para cada función.

### 3. Configurar o usar el backend

La aplicación inicializa Firebase desde `src/config/firebase.js`. Si tienes acceso al proyecto que ya está configurado, puedes iniciar el frontend y usar ese backend sin arrancar un servidor local.

Si vas a conectar tu propio proyecto Firebase:

1. Registra una aplicación web en Firebase y usa su configuración en `src/config/firebase.js`.
2. Activa **Correo electrónico/contraseña** en Firebase Authentication y crea la base de datos **Cloud Firestore**.
3. Configura las reglas de acceso para los usuarios y el personal. `firebase.json` hace referencia a `firestore.rules`, archivo que esta revisión no incluye. Necesitas tus propias reglas para reproducir el acceso a los datos y desplegar las reglas de una instancia nueva.
4. Para probar el panel de personal, un administrador de Firebase debe asignar a la cuenta el atributo personalizado `rol` con el valor `operador` o `administrador`.

Para instalar las dependencias de Cloud Functions y desplegar sus funciones en un proyecto que administras, ejecuta desde la raíz con Node.js 22:

```bash
npm ci --prefix functions
npx firebase-tools login
npx firebase-tools deploy --only functions --project TU_ID_DE_PROYECTO
```

Sustituye `TU_ID_DE_PROYECTO` por el identificador de tu proyecto. El despliegue requiere permisos y un plan de Firebase compatible con Cloud Functions. El frontend de esta revisión realiza sus operaciones con el SDK de Firestore. `functions/` declara las funciones invocables `consultarCupon`, `confirmarCompra` y `validarBoleto`.

### 4. Preparar los datos de catálogo

Los scripts de `tools/importacion/` leen los catálogos JSON de `src/data/`. Estos comandos muestran los documentos que se prepararían, sin escribir en Firebase:

```bash
npm ci --prefix tools/importacion
node tools/importacion/importar.cjs
node tools/importacion/importar-espectaculos.cjs
node tools/importacion/importar-comidas.cjs
```

Para una importación real, verifica el proyecto configurado en cada script y usa credenciales administrativas autorizadas mediante Application Default Credentials. Añade `--ejecutar` al comando correspondiente para crear los documentos. Los scripts tienen fijado el proyecto original, así que ajusta el destino antes de importar en una instancia propia.

## Recorrido de demostración

1. Entra en **Regístrate** y crea una cuenta de prueba. Usa **Perfil** para comprobar el cierre de sesión.
2. En **Inicio**, abre las categorías de atracciones, espectáculos y gastronomía. Explora sus detalles y consulta el mapa del parque.
3. En **Entradas**, elige la fecha y el tipo de boleto. Completa el pago simulado y abre el QR en el detalle del boleto.
4. En un segundo dispositivo o sesión, entra con una cuenta de personal y escanea el QR desde el **Panel de personal**.
5. En **Camina**, inicia la misión, registra distancia y consulta el saldo. Cuando tengas puntos suficientes, canjea un cupón en **Camina y Gana**.
6. Desde **Perfil → Notificaciones**, programa un recordatorio y comprueba su entrega en el dispositivo.

## Estructura del proyecto

```text
InkaPark-MOBILE/
├── App.js               # Proveedores y navegación raíz
├── index.js             # Punto de entrada de Expo
├── app.json             # Configuración de la aplicación y plugins
├── eas.json             # Perfil preview para generar el APK
├── firebase.json        # Configuración de Firebase CLI
├── assets/              # Imágenes, mapa e icono
├── screens/             # Pantallas de visitantes y del personal
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── config/          # Firebase y persistencia de sesión
│   ├── context/         # Autenticación, misión y notificaciones
│   ├── data/            # Archivos JSON del proyecto
│   ├── hooks/           # Lectura del rol de la cuenta
│   ├── navigation/      # Pilas de pantallas y pestañas
│   ├── services/        # Operaciones de catálogo, compras, acceso y recordatorios
│   ├── styles/         # Paleta visual
│   ├── theme/          # Tema de React Native Paper
│   └── utils/          # Lógica auxiliar y asignación de imágenes
├── functions/          # Funciones de servidor de Firebase
└── tools/importacion/  # Scripts de carga de catálogos
```

## Navegación, datos e interfaz

- **Sin sesión** · La aplicación muestra el flujo de inicio de sesión, registro y recuperación de contraseña.
- **Visitante** · Las pestañas principales son **Inicio**, **Camina**, **Mapa**, **Entradas** y **Perfil**. Los detalles y las pantallas de configuración se abren mediante navegación Stack.
- **Operador o administrador** · Después de iniciar sesión, la aplicación abre el panel de personal según el rol de la cuenta.
- **Datos e imágenes** · Los catálogos se consultan en Firestore. Las imágenes se empaquetan con la aplicación en `assets/` y se asignan según el nombre del elemento. Para cambiar las imágenes incluidas en un APK, genera una nueva build.
- **Interfaz** · React Native Paper aporta los componentes y el tema. Los contextos gestionan la sesión, la misión y los recordatorios.

## Generar o actualizar el APK de Android

Desde la raíz del repositorio, con acceso al proyecto Expo vinculado:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

El perfil `preview` de `eas.json` genera un APK para distribución interna. Cuando termine la compilación, abre la nueva build en el panel de Expo y pulsa **Install** para descargar el archivo.

Para actualizar una instalación existente, incrementa `expo.android.versionCode` en `app.json` antes de compilar y conserva el mismo paquete de Android y la misma clave de firma. Instala el APK de la nueva build en el dispositivo.

## Comprobaciones útiles

Generar los bundles de web, Android e iOS:

```bash
npx expo export --platform all
```

Reiniciar Metro con la caché limpia:

```bash
npx expo start --clear
```

La revisión funcional incluye autenticación, catálogos, compra simulada, QR, progreso de la misión y entrega de recordatorios. El proyecto se comprueba mediante compilación y pruebas manuales, ya que la aplicación no declara scripts de tests, lint o typecheck.

## Alcance del avance

- El flujo de pago es una simulación sin cobros reales.
- La validación de boletos requiere conexión a Firebase y una cuenta de personal autorizada.
- El mapa permite explorar el parque. El seguimiento de ubicación pertenece a **Camina y Gana**.
- La disponibilidad de cámara, GPS, podómetro y avisos locales depende del dispositivo y de sus permisos.

## Licencia

[MIT](LICENSE)
