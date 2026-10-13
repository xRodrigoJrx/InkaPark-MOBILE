# InkaPark Mobile — Avance 2: UI Framework

Aplicación desarrollada con **Expo y React Native** para explorar un parque temático inspirado en la cultura inca. Permite registrar una cuenta de demostración, iniciar sesión, consultar atracciones, espectáculos y gastronomía, explorar un mapa interactivo y visualizar entradas de ejemplo.

Este README describe la rama **`avance-2-ui-framework`**.

## Objetivos del avance

- Organizar el proyecto en pantallas, componentes reutilizables, navegación, estilos y datos.
- Integrar **React Native Paper** para construir una interfaz consistente.
- Combinar navegación **Stack y Bottom Tabs** mediante React Navigation.
- Gestionar formularios, sesión, filtros y ventanas de diálogo con hooks.
- Mostrar información desde archivos JSON locales, incluyendo carga y errores en la pantalla de entradas.
- Mantener una identidad visual con colores oscuros, dorados e imágenes del parque.

## Tecnologías y dependencias principales

| Tecnología | Versión declarada | Uso |
| --- | --- | --- |
| Expo | ~57.0.20 | Entorno de desarrollo y herramientas |
| React | 19.2.3 | Componentes y hooks |
| React Native | 0.86.3 | Interfaz multiplataforma |
| React Navigation | 7.x | Stack y pestañas inferiores |
| React Native Paper | ^5.15.3 | Componentes de interfaz y tema |
| react-native-screens | ~4.26.0 | Soporte de pantallas nativas |
| react-native-safe-area-context | ~5.7.0 | Soporte de áreas seguras |
| expo-linear-gradient | ~57.0.2 | Degradados en pantallas de detalle |
| React Native Web | ^0.21.2 | Ejecución en navegador |

Las dependencias completas están en `package.json`. `package-lock.json` registra las versiones instalables de forma reproducible. También se incluyen `expo-font`, `@expo/vector-icons` y `@expo-google-fonts/cinzel`; su instalación no implica que todas se utilicen actualmente.

## Requisitos

1. **Git**.
2. **Node.js compatible con Expo SDK 57**: Node 22.13 o superior dentro de la rama 22, o Node 24.3 o superior dentro de la rama 24. Se recomienda Node 24 LTS.
3. **npm**, incluido con Node.
4. Un navegador para la versión web; para móvil, **Expo Go compatible con SDK 57** o un entorno de desarrollo nativo compatible.

Comprueba las herramientas:

```bash
git --version
node --version
npm --version
```

## Instalación y ejecución paso a paso

### 1. Clonar la rama del avance

```bash
git clone --branch avance-2-ui-framework https://github.com/xRodrigoJrx/InkaPark-MOBILE.git
cd InkaPark-MOBILE
```

Si ya tienes el repositorio clonado, guarda tus cambios locales antes de cambiar de rama:

```bash
git fetch origin
git switch avance-2-ui-framework
```

### 2. Instalar las dependencias

```bash
npm ci
```

Este comando instala las dependencias desde el lockfile. No necesitas instalar cada biblioteca manualmente ni crear otro proyecto Expo.

Para agregar dependencias compatibles con el SDK durante futuros cambios, usa `npx expo install`. Por ejemplo:

```bash
npx expo install react-native-screens react-native-safe-area-context expo-linear-gradient
```

Este último comando es para mantenimiento; no es necesario repetirlo después de `npm ci` y puede actualizar archivos de dependencias.

### 3. Iniciar Expo

```bash
npx expo start
```

También puedes usar:

```bash
npm start
```

### 4. Abrir la aplicación

- **Web:** presiona `w` en la terminal de Expo o ejecuta `npm run web`.
- **Android físico:** abre Expo Go y escanea el QR. El teléfono y la computadora deben tener conectividad entre sí.
- **iPhone:** escanea el QR con la cámara y abre Expo Go, si la versión instalada admite SDK 57.
- **Emulador Android:** inicia un emulador configurado y presiona `a`.
- **Simulador iOS:** requiere macOS y Xcode; presiona `i`.

Si Expo Go no admite el SDK del proyecto, utiliza una versión compatible cuando esté disponible o prepara un development build. No cambies las versiones del proyecto solamente para evitar ese mensaje.

### 5. Recorrer el flujo de demostración

1. En Login, selecciona **Regístrate**.
2. Completa nombre, correo y teléfono de nueve dígitos que empiece por `9`.
3. Introduce una contraseña de al menos ocho caracteres, con mayúscula y número, y confírmala.
4. Crea la cuenta e inicia sesión con los mismos datos.
5. Explora las pestañas **Inicio**, **Mapa**, **Entradas** y **Perfil**.
6. Abre categorías y sus detalles; prueba los filtros.
7. En Perfil, selecciona **Cerrar sesión** y confirma con **Salir**.

Usa datos ficticios, por ejemplo `prueba@example.test` y `Prueba123!`. La cuenta permanece solo en memoria y se pierde al recargar o cerrar la aplicación.

## Estructura del proyecto

```text
InkaPark-MOBILE/
├── App.js                       # Estado de usuario, sesión y navegación raíz
├── index.js                     # Registro de la app y PaperProvider
├── app.json                     # Configuración Expo
├── package.json
├── package-lock.json
├── README.md
├── LICENSE
├── assets/                      # Imágenes y recursos locales
├── screens/
│   ├── Login.js
│   ├── Registro.js
│   ├── Inicio.js
│   ├── Atracciones.js
│   ├── DetalleAtraccion.js
│   ├── Espectaculos.js
│   ├── DetalleEspectaculo.js
│   ├── Gastronomia.js
│   ├── DetalleComida.js
│   ├── Entradas.js
│   ├── DetalleEntrada.js
│   ├── Mapa.js
│   └── Perfil.js
└── src/
    ├── components/
    │   ├── AuthLayout.js
    │   ├── Campo.js
    │   ├── TarjetaInka.js
    │   ├── BotonInka.js
    │   └── Validador.js
    ├── navigation/
    │   ├── AppStack.js
    │   ├── AuthStack.js
    │   └── MainTabs.js
    ├── data/
    │   ├── atracciones.json
    │   ├── espectaculos.json
    │   ├── comidas.json
    │   └── entradas.json
    ├── styles/
    │   └── paleta.js
    ├── theme/
    │   └── temaInka.js
    └── utils/
        └── imagenesAtracciones.js
```

Los hooks se utilizan dentro de las pantallas y `App.js`. Actualmente no existe una carpeta `hooks/` porque no se han extraído hooks personalizados.

## Navegación

`App.js` contiene `NavigationContainer`. `AppStack` selecciona el flujo según `sesionActiva`:

- **Sin sesión:** `AuthStack` con Login y Registro.
- **Con sesión:** `MainTabs` con Inicio, Mapa, Entradas y Perfil.
- **Dentro de Inicio:** un Stack abre categorías y detalles de atracciones, espectáculos y comida.
- **Dentro de Entradas:** otro Stack abre el detalle de cada entrada.

Las pantallas de detalle reciben el elemento seleccionado por `route.params`. Se implementan Stack y Tab; no se utiliza Drawer.

## Datos, estados y eventos

La aplicación usa mocks locales: **5 atracciones, 4 espectáculos, 6 comidas y 5 entradas**. No requiere API externa, claves ni servidor de backend para este avance.

- `useState`: formularios, usuario, sesión, filtros, carga, errores y modales.
- `useEffect`: carga inicial de datos y actualización del patrón visual de la entrada.
- `useMemo`: listas filtradas y contadores.
- `onChangeText`: actualización de los campos.
- `onPress`: botones, navegación, filtros y selección de zonas.

En `Entradas.js`, la carga simula una espera de 600 ms, valida el formato con `Array.isArray` y usa `try/catch/finally`. Muestra un indicador de carga, un mensaje de error o la lista. Los JSON se importan localmente; no se emplean `fetch` ni `axios`.

## Interfaz y componentes

`PaperProvider` aplica el tema oscuro de `src/theme/temaInka.js`. `src/styles/paleta.js` centraliza colores y fuentes.

`Campo` se reutiliza en los formularios, `AuthLayout` comparte el diseño de autenticación y `TarjetaInka` presenta atracciones en Inicio. Las pantallas también utilizan componentes de Paper, `FlatList`, `Pressable`, `ScrollView` y `useWindowDimensions`.

## Comprobaciones útiles

Para comprobar la compilación web:

```bash
npx expo export --platform web
```

Para reiniciar Metro limpiando su caché:

```bash
npx expo start --clear
```

La rama no define scripts de tests, lint o typecheck. La revisión funcional debe incluir registro, login, navegación, filtros, detalles, mapa y cierre de sesión.

## Alcance y funcionalidades pendientes

- La autenticación es una demostración local, sin persistencia ni backend.
- La recuperación de contraseña muestra un mensaje; no envía correos.
- El mapa es un croquis con zonas interactivas; no usa GPS.
- Las entradas son datos de ejemplo y no se vinculan al usuario registrado. Sus estados provienen del JSON, sin cálculo de vencimiento por fecha.
- El QR es un patrón gráfico de demostración, no un QR válido para escaneo.
- El botón **Descargar PDF** no implementa una descarga.
- Algunas opciones del perfil son visuales y aún no tienen acciones.
- `BotonInka.js`, `Validador.js` e `imagenesAtracciones.js` existen, pero no están conectados a las pantallas actuales.

## Ramas y documentación de evaluación

- `main`: versión del avance anterior al momento de esta revisión.
- `avance-2-ui-framework`: integración del framework visual, navegación y nuevas pantallas.

Consulta [Evidencias de la rúbrica](docs/EVIDENCIAS_RUBRICA.md) para encontrar fragmentos de código, explicación de su uso y una guía de verificación.

## Licencia

El repositorio incluye un archivo `LICENSE` con licencia MIT.

