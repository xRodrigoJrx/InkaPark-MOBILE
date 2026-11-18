import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  AppState,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Dialog,
  Icon,
  Portal,
  Text,
} from "react-native-paper";

import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { useIsFocused } from
  "@react-navigation/native";

import { useSafeAreaInsets } from
  "react-native-safe-area-context";

import { useAuth } from
  "../src/context/AuthContext";

import { COLORES, FUENTES } from
  "../src/styles/paleta";

import {
  leerValidacionPendiente,
  procesarAcceso,
} from "../src/services/accesoService";

function Aviso({ texto, error = false }) {
  if (!texto) return null;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.aviso,
        error && styles.avisoError,
      ]}
    >
      <Icon
        source={
          error
            ? "alert-circle-outline"
            : "information-outline"
        }
        size={22}
        color={
          error
            ? COLORES.error
            : COLORES.doradoClaro
        }
      />

      <Text style={styles.avisoTexto}>
        {texto}
      </Text>
    </View>
  );
}

function DatoPerfil({ icono, titulo, valor }) {
  return (
    <View style={styles.datoPerfil}>
      <View style={styles.datoIcono}>
        <Icon
          source={icono}
          size={23}
          color={COLORES.dorado}
        />
      </View>

      <View style={styles.flex}>
        <Text style={styles.etiqueta}>
          {titulo}
        </Text>

        <Text style={styles.valorPerfil}>
          {valor}
        </Text>
      </View>
    </View>
  );
}

export default function PanelPersonal({ rol }) {
  const { cuenta, salir } = useAuth();
  const uid = cuenta.uid;

  const insets = useSafeAreaInsets();
  const enfocado = useIsFocused();

  const [
    permiso,
    solicitarPermiso,
    consultarPermiso,
  ] = useCameraPermissions();

  const [modo, setModo] = useState("panel");

  const [activa, setActiva] = useState(
    AppState.currentState === "active"
  );

  const [linterna, setLinterna] = useState(false);
  const [camaraLista, setCamaraLista] =
    useState(false);

  const [ocupado, setOcupado] = useState(false);
  const [inicializando, setInicializando] =
    useState(true);

  const [pendiente, setPendiente] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const [errorCamara, setErrorCamara] =
    useState("");

  const [errorPendiente, setErrorPendiente] =
    useState(false);

  const [
    confirmarSalida,
    setConfirmarSalida,
  ] = useState(false);

  const [visor, setVisor] = useState({
    ancho: 0,
    alto: 0,
  });

  const bloqueo = useRef(false);
  const lecturaBloqueada = useRef(true);
  const montado = useRef(true);
  const activaRef = useRef(activa);

  const nombreRol =
    rol === "administrador"
      ? "Administrador"
      : "Operador de acceso";

  // Se calcula con las medidas REALES del visor.
  // El texto de ayuda no interviene en este cálculo.
  const ladoMarco =
    visor.ancho > 0 && visor.alto > 0
      ? Math.max(
          0,
          Math.min(
            225,
            visor.ancho - 48,
            visor.alto - 96
          )
        )
      : 0;

  const izquierdaMarco =
    (visor.ancho - ladoMarco) / 2;

  const arribaMarco =
    (visor.alto - ladoMarco) / 2;

  useEffect(() => {
    montado.current = true;

    return () => {
      montado.current = false;
      lecturaBloqueada.current = true;
    };
  }, []);

  useEffect(() => {
    const suscripcion =
      AppState.addEventListener(
        "change",
        (estado) => {
          const visible = estado === "active";

          activaRef.current = visible;
          setActiva(visible);

          if (!visible) {
            lecturaBloqueada.current = true;
            setCamaraLista(false);
            setLinterna(false);
          } else {
            consultarPermiso().catch(() => {
              if (montado.current) {
                setMensaje(
                  "No se pudo actualizar el permiso de cámara."
                );
              }
            });
          }
        }
      );

    return () => suscripcion.remove();
  }, [consultarPermiso]);

  useEffect(() => {
    if (!enfocado) {
      lecturaBloqueada.current = true;
      setCamaraLista(false);
      setLinterna(false);
    }
  }, [enfocado]);

  useEffect(() => {
    let vigente = true;

    async function iniciar() {
      try {
        const guardado =
          await leerValidacionPendiente(uid);

        if (!vigente) return;

        setPendiente(guardado);
        setErrorPendiente(false);
      } catch (error) {
        if (!vigente) return;

        setErrorPendiente(true);
        setMensaje(error.message);
      } finally {
        if (vigente) {
          setInicializando(false);
        }
      }
    }

    iniciar();

    return () => {
      vigente = false;
    };
  }, [uid]);

  async function actualizarPendiente() {
    try {
      const guardado =
        await leerValidacionPendiente(uid);

      if (montado.current) {
        setPendiente(guardado);
        setErrorPendiente(false);
      }
    } catch (error) {
      if (montado.current) {
        setErrorPendiente(true);
        setMensaje(error.message);
      }
    }
  }

  function cambiarSeccion(seccion) {
    if (bloqueo.current) return;

    lecturaBloqueada.current = true;
    setLinterna(false);
    setCamaraLista(false);
    setModo(seccion);

    if (!errorPendiente && !pendiente) {
      setMensaje("");
    }
  }

  function abrirEscaner() {
    if (
      bloqueo.current ||
      inicializando ||
      pendiente ||
      errorPendiente
    ) {
      return;
    }

    lecturaBloqueada.current = true;

    setMensaje("");
    setResultado(null);
    setErrorCamara("");
    setCamaraLista(false);
    setLinterna(false);
    setModo("escaner");
  }

  async function pedirCamara() {
    if (bloqueo.current) return;

    bloqueo.current = true;
    setOcupado(true);
    setMensaje("");

    try {
      const respuesta =
        await solicitarPermiso();

      if (!respuesta.granted) {
        setMensaje(
          respuesta.canAskAgain
            ? "No se concedió el permiso. Puedes solicitarlo nuevamente."
            : "Activa la cámara desde los ajustes del dispositivo."
        );
      }
    } catch {
      setMensaje(
        "No se pudo solicitar el permiso de cámara."
      );
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
      }
    }
  }

  async function abrirAjustes() {
    try {
      await Linking.openSettings();
    } catch {
      setMensaje(
        "No se pudieron abrir los ajustes."
      );
    }
  }

  async function validar(qr = null) {
    if (bloqueo.current) return;

    if (
      qr &&
      (
        lecturaBloqueada.current ||
        !activaRef.current
      )
    ) {
      return;
    }

    bloqueo.current = true;
    lecturaBloqueada.current = true;

    setOcupado(true);
    setMensaje("");
    setLinterna(false);

    try {
      const respuesta = await procesarAcceso(qr);

      if (montado.current) {
        setResultado(respuesta);
        setPendiente(null);
        setModo("escaner");
      }
    } catch (error) {
      if (montado.current) {
        setResultado(null);

        setMensaje(
          error.message ||
          "No se pudo confirmar la validación."
        );
      }
    } finally {
      await actualizarPendiente();

      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
      }
    }
  }

  function siguiente() {
    if (
      bloqueo.current ||
      pendiente ||
      errorPendiente
    ) {
      return;
    }

    lecturaBloqueada.current = true;

    setResultado(null);
    setMensaje("");
    setErrorCamara("");
    setCamaraLista(false);
    setLinterna(false);
    setModo("escaner");
  }

  function cerrarSesion() {
    if (bloqueo.current) return;
    setConfirmarSalida(true);
  }

  async function confirmarCerrarSesion() {
    if (bloqueo.current) return;

    setConfirmarSalida(false);
    bloqueo.current = true;
    setOcupado(true);

    try {
      await salir();
    } catch (error) {
      if (montado.current) {
        setMensaje(
          error?.message ||
            "No se pudo cerrar la sesión."
        );
      }
    } finally {
      bloqueo.current = false;

      if (montado.current) {
        setOcupado(false);
      }
    }
  }

  const puedeEscanear =
    !ocupado &&
    !inicializando &&
    !pendiente &&
    !errorPendiente;

  const puedeMostrarCamara =
    modo === "escaner" &&
    permiso?.granted &&
    enfocado &&
    activa &&
    puedeEscanear &&
    !resultado &&
    !errorCamara &&
    !mensaje;

  return (
    <View style={styles.pantalla}>
      <ScrollView
        contentContainerStyle={[
          styles.contenido,
          {
            paddingTop: Math.max(
              insets.top,
              18
            ),
            paddingBottom:
              Math.max(insets.bottom, 18) + 20,
          },
        ]}
      >
        {/* CABECERA */}
        <View style={styles.cabecera}>
          <Image
            source={require("../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.flex}>
            <Text style={styles.marca}>
              INKAPARK
            </Text>

            <Text style={styles.submarca}>
              CONTROL DE ACCESO
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir mi perfil"
            disabled={ocupado}
            onPress={() =>
              cambiarSeccion("perfil")
            }
            style={[
              styles.iconoCabecera,
              ocupado && styles.deshabilitado,
            ]}
          >
            <Icon
              source="account-circle-outline"
              size={30}
              color={COLORES.doradoClaro}
            />
          </Pressable>
        </View>

        {/* CUENTA: ACCESO AL PERFIL */}
        {modo !== "perfil" && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver perfil del personal"
            disabled={ocupado}
            onPress={() =>
              cambiarSeccion("perfil")
            }
            style={styles.identidad}
          >
            <Icon
              source="account-check-outline"
              size={24}
              color={COLORES.dorado}
            />

            <View style={styles.flex}>
              <Text style={styles.nombreRol}>
                {nombreRol}
              </Text>

              <Text style={styles.secundario}>
                {cuenta.email}
              </Text>
            </View>

            <Icon
              source="chevron-right"
              size={23}
              color={COLORES.doradoClaro}
            />
          </Pressable>
        )}

        {/* NAVEGACIÓN: NO APARECE SOBRE LA CÁMARA */}
        {modo !== "escaner" && (
          <View style={styles.pestanas}>
            {[
              {
                id: "panel",
                texto: "Panel",
                icono: "view-dashboard-outline",
              },
              {
                id: "perfil",
                texto: "Mi perfil",
                icono: "account-outline",
              },
            ].map((opcion) => {
              const seleccionada =
                modo === opcion.id;

              return (
                <Pressable
                  key={opcion.id}
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: seleccionada,
                  }}
                  disabled={ocupado}
                  onPress={() =>
                    cambiarSeccion(opcion.id)
                  }
                  style={[
                    styles.pestana,
                    seleccionada &&
                      styles.pestanaActiva,
                  ]}
                >
                  <Icon
                    source={opcion.icono}
                    size={21}
                    color={
                      seleccionada
                        ? COLORES.botonTexto
                        : COLORES.textoSecundario
                    }
                  />

                  <Text
                    style={[
                      styles.pestanaTexto,
                      seleccionada && {
                        color: COLORES.botonTexto,
                      },
                    ]}
                  >
                    {opcion.texto}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Aviso texto={mensaje} error />

        {inicializando && (
          <View style={styles.panelCentrado}>
            <ActivityIndicator
              color={COLORES.dorado}
            />

            <Text style={styles.secundario}>
              Comprobando operaciones pendientes…
            </Text>
          </View>
        )}

        {/* VALIDACIÓN PENDIENTE */}
        {!!pendiente && (
          <View style={styles.panel}>
            <View style={styles.fila}>
              <Icon
                source="cloud-sync-outline"
                size={29}
                color={COLORES.advertencia}
              />

              <Text style={styles.tituloSeccion}>
                Validación pendiente
              </Text>
            </View>

            <Text style={styles.secundario}>
              Primero recuperaremos el resultado
              anterior. No autorices otro ingreso
              mientras siga pendiente.
            </Text>

            <Text
              selectable
              style={styles.codigo}
            >
              {pendiente.boletoId}
            </Text>

            <Button
              mode="contained"
              icon="refresh"
              loading={ocupado}
              disabled={ocupado}
              buttonColor={COLORES.boton}
              textColor={COLORES.botonTexto}
              onPress={() => validar()}
              contentStyle={styles.botonAlto}
              style={styles.botonRedondo}
            >
              Recuperar resultado
            </Button>
          </View>
        )}

        {/* PANEL */}
        {modo === "panel" && (
          <>
            <Text style={styles.titulo}>
              Panel del personal
            </Text>

            <Text style={styles.secundario}>
              Comprueba cada boleto antes de
              permitir el ingreso al parque.
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir escáner"
              disabled={!puedeEscanear}
              onPress={abrirEscaner}
              style={[
                styles.tarjetaEscaner,
                !puedeEscanear &&
                  styles.deshabilitado,
              ]}
            >
              <View style={styles.iconoEscaner}>
                <Icon
                  source="qrcode-scan"
                  size={43}
                  color={COLORES.botonTexto}
                />
              </View>

              <Text style={styles.tituloTarjeta}>
                Escanear entrada
              </Text>

              <Text style={styles.textoTarjeta}>
                Valida el QR y registra una sola
                admisión por boleto.
              </Text>

              <View style={styles.fila}>
                <Text style={styles.enlace}>
                  Abrir cámara
                </Text>

                <Icon
                  source="arrow-right"
                  size={23}
                  color={COLORES.doradoClaro}
                />
              </View>
            </Pressable>

            <View style={styles.panel}>
              <View style={styles.fila}>
                <Icon
                  source="shield-check-outline"
                  size={24}
                  color={COLORES.dorado}
                />

                <Text style={styles.tituloSeccion}>
                  Validación online
                </Text>
              </View>

              <Text style={styles.secundario}>
                El QR digital y sus copias impresas
                representan el mismo boleto.
                Después de utilizarlo, ninguna copia
                permite otro ingreso.
              </Text>
            </View>
          </>
        )}

        {/* PERFIL */}
        {modo === "perfil" && (
          <>
            <View style={styles.perfilCabecera}>
              <View style={styles.avatar}>
                <Icon
                  source="account-tie-outline"
                  size={48}
                  color={COLORES.doradoClaro}
                />
              </View>

              <Text style={styles.titulo}>
                Mi perfil
              </Text>

              <View style={styles.insigniaRol}>
                <Icon
                  source="shield-account-outline"
                  size={17}
                  color={COLORES.doradoClaro}
                />

                <Text style={styles.insigniaTexto}>
                  {nombreRol}
                </Text>
              </View>
            </View>

            <View style={styles.panel}>
              <Text style={styles.tituloSeccion}>
                Información de la cuenta
              </Text>

              <DatoPerfil
                icono="email-outline"
                titulo="CORREO"
                valor={cuenta.email}
              />

              <View style={styles.separador} />

              <DatoPerfil
                icono="shield-check-outline"
                titulo="TIPO DE ACCESO"
                valor={nombreRol}
              />

              <View style={styles.separador} />

              <DatoPerfil
                icono="camera-outline"
                titulo="PERMISO DE CÁMARA"
                valor={
                  !permiso
                    ? "Consultando…"
                    : permiso.granted
                    ? "Concedido"
                    : permiso.status === "undetermined"
                    ? "Sin solicitar"
                    : "No concedido"
                }
              />

              <Button
                icon="cog-outline"
                textColor={COLORES.doradoClaro}
                disabled={ocupado}
                onPress={abrirAjustes}
              >
                Ajustes del dispositivo
              </Button>
            </View>

            <View style={styles.panel}>
              <View style={styles.fila}>
                <Icon
                  source="lock-outline"
                  size={24}
                  color={COLORES.dorado}
                />

                <Text style={styles.tituloSeccion}>
                  Sesión del personal
                </Text>
              </View>

              <Text style={styles.secundario}>
                Cierra tu sesión si otra persona
                utilizará este dispositivo.
              </Text>

              {/* CERRAR SESIÓN SOLO EXISTE EN PERFIL */}
              <Button
                mode="outlined"
                icon="logout"
                textColor={COLORES.error}
                disabled={ocupado}
                loading={ocupado}
                onPress={cerrarSesion}
                contentStyle={styles.botonAlto}
                style={styles.botonSalir}
              >
                Cerrar sesión
              </Button>
            </View>
          </>
        )}

        {/* ESCÁNER */}
        {modo === "escaner" && (
          <>
            <View style={styles.fila}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver al panel"
                disabled={ocupado}
                onPress={() =>
                  cambiarSeccion("panel")
                }
                style={styles.botonIcono}
              >
                <Icon
                  source="arrow-left"
                  size={24}
                  color={COLORES.crema}
                />
              </Pressable>

              <View style={styles.flex}>
                <Text style={styles.titulo}>
                  Escanear boleto
                </Text>

                <Text style={styles.secundario}>
                  Un boleto a la vez
                </Text>
              </View>
            </View>

            {!permiso &&
              !resultado &&
              !pendiente && (
                <View style={styles.panelCentrado}>
                  <ActivityIndicator
                    color={COLORES.dorado}
                  />

                  <Text style={styles.secundario}>
                    Consultando permiso de cámara…
                  </Text>
                </View>
              )}

            {permiso &&
              !permiso.granted &&
              !resultado &&
              !pendiente && (
                <View style={styles.panelCentrado}>
                  <View style={styles.iconoPermiso}>
                    <Icon
                      source="camera-outline"
                      size={42}
                      color={COLORES.dorado}
                    />
                  </View>

                  <Text style={styles.tituloSeccion}>
                    Necesitamos la cámara
                  </Text>

                  <Text style={styles.textoCentrado}>
                    La utilizamos para leer el QR.
                    No grabamos video ni audio.
                  </Text>

                  <Button
                    mode="contained"
                    icon={
                      permiso.canAskAgain
                        ? "camera"
                        : "cog-outline"
                    }
                    loading={ocupado}
                    disabled={ocupado}
                    buttonColor={COLORES.boton}
                    textColor={COLORES.botonTexto}
                    onPress={
                      permiso.canAskAgain
                        ? pedirCamara
                        : abrirAjustes
                    }
                    contentStyle={styles.botonAlto}
                  >
                    {permiso.canAskAgain
                      ? "Permitir cámara"
                      : "Abrir Ajustes"}
                  </Button>

                  <Button
                    textColor={COLORES.doradoClaro}
                    disabled={ocupado}
                    onPress={() =>
                      consultarPermiso().catch(() =>
                        setMensaje(
                          "No se pudo consultar el permiso."
                        )
                      )
                    }
                  >
                    Comprobar permiso
                  </Button>
                </View>
              )}

            {puedeMostrarCamara && (
              <>
                <View style={styles.camaraBorde}>
                  <View
                    style={styles.visor}
                    onLayout={(evento) => {
                      const { width, height } =
                        evento.nativeEvent.layout;

                      setVisor((anterior) => {
                        if (
                          anterior.ancho === width &&
                          anterior.alto === height
                        ) {
                          return anterior;
                        }

                        return {
                          ancho: width,
                          alto: height,
                        };
                      });
                    }}
                  >
                    <CameraView
                      style={styles.camara}
                      facing="back"
                      enableTorch={linterna}
                      barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                      }}
                      onCameraReady={() => {
                        setCamaraLista(true);

                        if (
                          !bloqueo.current &&
                          activaRef.current
                        ) {
                          lecturaBloqueada.current = false;
                        }
                      }}
                      onMountError={() => {
                        lecturaBloqueada.current = true;

                        setErrorCamara(
                          "No se pudo iniciar la cámara. Cierra otras aplicaciones que la estén utilizando."
                        );
                      }}
                      onBarcodeScanned={({ data }) => {
                        validar(data);
                      }}
                    />

                    {/* POSICIÓN GEOMÉTRICA EXPLÍCITA.
                        No utiliza flex ni incluye textos. */}
                    {ladoMarco > 0 && (
                      <View
                        pointerEvents="none"
                        style={[
                          styles.marcoLectura,
                          {
                            width: ladoMarco,
                            height: ladoMarco,
                            left: izquierdaMarco,
                            top: arribaMarco,
                          },
                        ]}
                      />
                    )}
                  </View>
                </View>

                {/* FUERA DE LA CÁMARA:
                    no puede desplazar el marco. */}
                <View style={styles.ayudaEscaner}>
                  <Icon
                    source="qrcode"
                    size={21}
                    color={COLORES.doradoClaro}
                  />

                  <Text style={styles.ayudaTexto}>
                    Centra el QR completo dentro
                    del marco amarillo
                  </Text>
                </View>

                {!camaraLista && (
                  <Text style={styles.textoCentrado}>
                    Preparando cámara…
                  </Text>
                )}

                <Button
                  icon={
                    linterna
                      ? "flashlight-off"
                      : "flashlight"
                  }
                  mode="outlined"
                  textColor={COLORES.doradoClaro}
                  disabled={!camaraLista}
                  onPress={() =>
                    setLinterna((valor) => !valor)
                  }
                  style={styles.botonRedondo}
                >
                  {linterna
                    ? "Apagar linterna"
                    : "Encender linterna"}
                </Button>

                <Aviso texto="La lectura inicia la validación. Espera el resultado antes de permitir el ingreso." />
              </>
            )}

            {!!errorCamara && (
              <View style={styles.panel}>
                <Aviso
                  texto={errorCamara}
                  error
                />

                <Button
                  icon="refresh"
                  textColor={COLORES.doradoClaro}
                  onPress={siguiente}
                >
                  Reintentar cámara
                </Button>
              </View>
            )}

            {ocupado && (
              <View style={styles.panelCentrado}>
                <ActivityIndicator
                  size="large"
                  color={COLORES.dorado}
                />

                <Text style={styles.tituloSeccion}>
                  Comprobando en Firebase
                </Text>

                <Text style={styles.textoCentrado}>
                  Todavía no autorices el ingreso.
                </Text>
              </View>
            )}

            {!!resultado && !ocupado && (
              <View
                style={[
                  styles.resultado,
                  {
                    borderColor:
                      resultado.aceptado
                        ? COLORES.correcto
                        : COLORES.error,
                  },
                ]}
              >
                <View
                  style={[
                    styles.resultadoIcono,
                    {
                      backgroundColor:
                        resultado.aceptado
                          ? "#253721"
                          : "#42251E",
                    },
                  ]}
                >
                  <Icon
                    source={
                      resultado.aceptado
                        ? "check"
                        : "close"
                    }
                    size={48}
                    color={
                      resultado.aceptado
                        ? COLORES.correcto
                        : COLORES.error
                    }
                  />
                </View>

                <Text
                  style={[
                    styles.resultadoTitulo,
                    {
                      color:
                        resultado.aceptado
                          ? COLORES.correcto
                          : COLORES.error,
                    },
                  ]}
                >
                  {resultado.titulo}
                </Text>

                <Text style={styles.textoCentrado}>
                  {resultado.mensaje}
                </Text>

                {!!resultado.tipo && (
                  <Text style={styles.datoResultado}>
                    {resultado.tipo === "menor"
                      ? "Entrada menor"
                      : "Entrada adulto"}
                  </Text>
                )}

                {!!resultado.fecha && (
                  <Text style={styles.secundario}>
                    Visita: {resultado.fecha}
                  </Text>
                )}

                {!!resultado.boletoId && (
                  <Text
                    selectable
                    style={styles.codigo}
                  >
                    {resultado.boletoId}
                  </Text>
                )}

                <Button
                  mode="contained"
                  icon="qrcode-scan"
                  disabled={
                    !!pendiente ||
                    errorPendiente
                  }
                  buttonColor={COLORES.boton}
                  textColor={COLORES.botonTexto}
                  onPress={siguiente}
                  contentStyle={styles.botonAlto}
                  style={styles.botonRedondo}
                >
                  Escanear siguiente
                </Button>
              </View>
            )}

            {!!mensaje &&
              !resultado &&
              !pendiente &&
              !ocupado &&
              !errorPendiente &&
              !!permiso?.granted && (
                <Button
                  icon="refresh"
                  textColor={COLORES.doradoClaro}
                  onPress={siguiente}
                >
                  Preparar otra lectura
                </Button>
              )}
          </>
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={confirmarSalida}
          onDismiss={() => {
            if (!ocupado) {
              setConfirmarSalida(false);
            }
          }}
          style={styles.dialogo}
        >
          <Dialog.Title style={styles.dialogoTitulo}>
            Cerrar sesión
          </Dialog.Title>

          <Dialog.Content>
            <Text style={styles.dialogoTexto}>
              {pendiente
                ? "La validación pendiente se conservará para recuperarla con esta misma cuenta."
                : "¿Quieres salir de tu cuenta de personal?"}
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              disabled={ocupado}
              textColor={COLORES.doradoClaro}
              onPress={() =>
                setConfirmarSalida(false)
              }
            >
              Cancelar
            </Button>

            <Button
              disabled={ocupado}
              textColor={COLORES.error}
              onPress={confirmarCerrarSesion}
            >
              Cerrar sesión
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },
  contenido: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 18,
    gap: 17,
  },
  flex: {
    flex: 1,
  },
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  logo: {
    width: 65,
    height: 50,
  },
  marca: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 23,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  submarca: {
    color: COLORES.doradoClaro,
    fontSize: 10,
    letterSpacing: 1.3,
    marginTop: 5,
  },
  iconoCabecera: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#382510",
  },
  identidad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#2C1C0E",
    borderRadius: 18,
  },
  nombreRol: {
    color: COLORES.crema,
    fontWeight: "bold",
    fontSize: 16,
  },
  titulo: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 25,
    fontWeight: "bold",
  },
  secundario: {
    color: COLORES.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  panel: {
    backgroundColor: "#24160B",
    borderWidth: 1,
    borderColor: "#63451F",
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  panelCentrado: {
    backgroundColor: "#24160B",
    borderWidth: 1,
    borderColor: "#63451F",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 17,
  },
  tituloSeccion: {
    color: COLORES.crema,
    fontSize: 18,
    fontWeight: "bold",
    flexShrink: 1,
  },
  tarjetaEscaner: {
    padding: 24,
    gap: 16,
    borderRadius: 23,
    backgroundColor: "#30200F",
    borderWidth: 1,
    borderColor: COLORES.dorado,
  },
  iconoEscaner: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORES.boton,
  },
  tituloTarjeta: {
    color: COLORES.crema,
    fontSize: 25,
    fontWeight: "bold",
  },
  textoTarjeta: {
    color: COLORES.textoSecundario,
    fontSize: 15,
    lineHeight: 23,
  },
  enlace: {
    color: COLORES.doradoClaro,
    fontWeight: "bold",
    fontSize: 15,
  },
  aviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 13,
    backgroundColor: "#35260F",
    borderRadius: 14,
  },
  avisoError: {
    backgroundColor: "#40231C",
  },
  avisoTexto: {
    flex: 1,
    color: COLORES.crema,
    fontSize: 13,
    lineHeight: 20,
  },
  deshabilitado: {
    opacity: 0.45,
  },
  botonIcono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#30200F",
    justifyContent: "center",
    alignItems: "center",
  },
  iconoPermiso: {
    padding: 20,
    backgroundColor: "#3A2712",
    borderRadius: 25,
  },
  textoCentrado: {
    color: COLORES.textoSecundario,
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  botonAlto: {
    minHeight: 50,
  },
  botonRedondo: {
    borderRadius: 15,
  },

  // El borde exterior no participa en el cálculo del centro.
  camaraBorde: {
    borderWidth: 2,
    borderColor: "#80602B",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#000000",
  },

  // Este es el rectángulo real que medimos.
  visor: {
    height: 360,
    width: "100%",
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#000000",
  },

  camara: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },

  // Sin flex, sin márgenes y sin textos en el contenedor.
  marcoLectura: {
    position: "absolute",
    borderWidth: 3,
    borderColor: COLORES.doradoClaro,
    borderRadius: 24,
    backgroundColor: "transparent",
    zIndex: 2,
  },

  ayudaEscaner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#2C1C0E",
  },
  ayudaTexto: {
    flexShrink: 1,
    color: COLORES.crema,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  resultado: {
    padding: 24,
    gap: 16,
    borderRadius: 23,
    borderWidth: 1,
    backgroundColor: "#24160B",
    alignItems: "center",
  },
  resultadoIcono: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: "center",
    justifyContent: "center",
  },
  resultadoTitulo: {
    fontSize: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  datoResultado: {
    color: COLORES.crema,
    fontWeight: "bold",
    fontSize: 17,
  },
  codigo: {
    color: COLORES.textoSecundario,
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
  },
  pestanas: {
    flexDirection: "row",
    padding: 5,
    borderRadius: 17,
    backgroundColor: "#211309",
    borderWidth: 1,
    borderColor: "#50371D",
    gap: 5,
  },
  pestana: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    minHeight: 46,
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  pestanaActiva: {
    backgroundColor: COLORES.boton,
  },
  pestanaTexto: {
    color: COLORES.textoSecundario,
    fontSize: 14,
    fontWeight: "bold",
  },
  perfilCabecera: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 15,
  },
  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#382510",
    borderWidth: 1,
    borderColor: "#80602B",
    alignItems: "center",
    justifyContent: "center",
  },
  insigniaRol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#382510",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  insigniaTexto: {
    color: COLORES.doradoClaro,
    fontSize: 12,
    fontWeight: "bold",
  },
  datoPerfil: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 5,
  },
  datoIcono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#382510",
    justifyContent: "center",
    alignItems: "center",
  },
  etiqueta: {
    color: COLORES.textoSecundario,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  valorPerfil: {
    color: COLORES.crema,
    fontSize: 15,
    lineHeight: 22,
  },
  separador: {
    height: 1,
    backgroundColor: "#50371D",
  },
  botonSalir: {
    borderColor: COLORES.error,
    borderRadius: 15,
    marginTop: 6,
  },
  dialogo: {
    backgroundColor: "#24160B",
  },
  dialogoTitulo: {
    color: COLORES.crema,
  },
  dialogoTexto: {
    color: COLORES.textoSecundario,
    fontSize: 14,
    lineHeight: 22,
  },
});