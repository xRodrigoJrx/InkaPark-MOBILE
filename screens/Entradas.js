import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Checkbox,
  Icon,
  Text,
  TextInput,
} from "react-native-paper";

import { useSafeAreaInsets } from
  "react-native-safe-area-context";

import AsyncStorage from
  "@react-native-async-storage/async-storage";

import * as Crypto from "expo-crypto";

import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { db } from "../src/config/firebase";

import { useAuth } from
  "../src/context/AuthContext";

import { COLORES, FUENTES } from
  "../src/styles/paleta";

import {
  MAX_BOLETOS,
  PRECIOS,
  confirmarCompra,
  consultarCupon,
  hoyLima,
  resumen,
  soles,
} from "../src/services/entradasService";

const TIPOS = {
  menor: {
    nombre: "Menor",
    descripcion: "Menos de 18 años",
    icono: "human-child",
  },
  adulto: {
    nombre: "Adulto",
    descripcion: "Desde 18 años",
    icono: "account-outline",
  },
};

function inicial() {
  return {
    fecha: hoyLima(),
    items: [],
    pendiente: null,
    ultimaCompra: null,
  };
}

function fechaValida(fecha) {
  if (
    typeof fecha !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fecha)
  ) {
    return false;
  }

  const valor = new Date(`${fecha}T12:00:00Z`);

  return (
    !Number.isNaN(valor.getTime()) &&
    valor.toISOString().slice(0, 10) === fecha
  );
}

function fechaBonita(fecha) {
  if (!fechaValida(fecha)) return fecha;

  const [anio, mes, dia] = fecha.split("-");

  return `${dia}/${mes}/${anio}`;
}

function estadoBoleto(boleto) {
  if (
    boleto.estado === "activa" &&
    boleto.fecha < hoyLima()
  ) {
    return "expirada";
  }

  return boleto.estado;
}

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
        size={21}
        color={
          error
            ? COLORES.error
            : COLORES.doradoClaro
        }
      />

      <Text
        style={[
          styles.avisoTexto,
          error && { color: COLORES.error },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

function EncabezadoSeccion({
  icono,
  titulo,
  descripcion,
}) {
  return (
    <View style={styles.encabezadoSeccion}>
      <View style={styles.iconoSeccion}>
        <Icon
          source={icono}
          size={23}
          color={COLORES.doradoClaro}
        />
      </View>

      <View style={styles.flex}>
        <Text style={styles.tituloSeccion}>
          {titulo}
        </Text>

        {!!descripcion && (
          <Text style={styles.secundario}>
            {descripcion}
          </Text>
        )}
      </View>
    </View>
  );
}

function FilaImporte({
  titulo,
  valor,
  descuento = false,
  grande = false,
}) {
  return (
    <View style={styles.filaImporte}>
      <Text
        style={[
          styles.secundario,
          grande && styles.totalTexto,
        ]}
      >
        {titulo}
      </Text>

      <Text
        style={[
          styles.importe,
          descuento && {
            color: COLORES.correcto,
          },
          grande && styles.totalImporte,
        ]}
      >
        {valor}
      </Text>
    </View>
  );
}

function ResumenImportes({ datos }) {
  return (
    <View style={styles.resumenImportes}>
      <FilaImporte
        titulo="Subtotal con IGV"
        valor={soles(datos.subtotal)}
      />

      <FilaImporte
        titulo="Descuentos"
        valor={`−${soles(datos.descuento)}`}
        descuento
      />

      <View style={styles.separador} />

      <FilaImporte
        titulo="Base sin IGV"
        valor={soles(datos.base)}
      />

      <FilaImporte
        titulo="IGV incluido · 18%"
        valor={soles(datos.igv)}
      />

      <View style={styles.separador} />

      <FilaImporte
        titulo="Total"
        valor={soles(datos.total)}
        grande
      />
    </View>
  );
}

function ContadorTipo({
  tipo,
  cantidad,
  bloqueado,
  puedeAgregar,
  agregar,
  quitar,
}) {
  const configuracion = TIPOS[tipo];

  return (
    <View style={styles.tipoCard}>
      <View style={styles.fila}>
        <View style={styles.iconoTipo}>
          <Icon
            source={configuracion.icono}
            size={30}
            color={COLORES.doradoClaro}
          />
        </View>

        <View style={styles.flex}>
          <Text style={styles.tipoNombre}>
            {configuracion.nombre}
          </Text>

          <Text style={styles.secundario}>
            {configuracion.descripcion}
          </Text>
        </View>

        <Text style={styles.precio}>
          {soles(PRECIOS[tipo])}
        </Text>
      </View>

      <View style={styles.contadorFila}>
        <Text style={styles.nota}>
          Precio final por persona
        </Text>

        <View style={styles.contador}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              `Quitar un boleto ${configuracion.nombre}`
            }
            disabled={bloqueado || cantidad === 0}
            onPress={quitar}
            style={[
              styles.botonContador,
              (bloqueado || cantidad === 0) &&
                styles.deshabilitado,
            ]}
          >
            <Icon
              source="minus"
              size={22}
              color={COLORES.crema}
            />
          </Pressable>

          <Text style={styles.numeroContador}>
            {cantidad}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              `Agregar un boleto ${configuracion.nombre}`
            }
            disabled={bloqueado || !puedeAgregar}
            onPress={agregar}
            style={[
              styles.botonContador,
              styles.botonContadorMas,
              (bloqueado || !puedeAgregar) &&
                styles.deshabilitado,
            ]}
          >
            <Icon
              source="plus"
              size={22}
              color={COLORES.botonTexto}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function BoletoCarrito({
  item,
  numero,
  bloqueado,
  cambiar,
  eliminar,
  aplicar,
}) {
  const [codigo, setCodigo] = useState(
    item.codigoCupon || ""
  );

  const [mostrarCupon, setMostrarCupon] =
    useState(!!item.codigoCupon);

  useEffect(() => {
    setCodigo(item.codigoCupon || "");

    if (item.codigoCupon) {
      setMostrarCupon(true);
    }
  }, [item.codigoCupon]);

  const precio = PRECIOS[item.tipo];

  const descuento = Math.round(
    precio * (item.porcentaje || 0) / 100
  );

  return (
    <View
      style={[
        styles.boletoCard,
        !item.seleccionado &&
          styles.boletoNoSeleccionado,
      ]}
    >
      <View style={styles.fila}>
        <Checkbox
          status={
            item.seleccionado
              ? "checked"
              : "unchecked"
          }
          color={COLORES.dorado}
          uncheckedColor={COLORES.textoSecundario}
          disabled={bloqueado}
          onPress={() =>
            cambiar({
              seleccionado: !item.seleccionado,
            })
          }
        />

        <View style={styles.flex}>
          <Text style={styles.boletoTitulo}>
            Boleto {numero} ·{" "}
            {TIPOS[item.tipo].nombre}
          </Text>

          <Text style={styles.nota}>
            {item.seleccionado
              ? "Incluido en esta compra"
              : "Se conservará en el carrito"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Eliminar boleto ${numero}`}
          disabled={bloqueado}
          onPress={eliminar}
          style={styles.botonIcono}
        >
          <Icon
            source="trash-can-outline"
            size={22}
            color={COLORES.error}
          />
        </Pressable>
      </View>

      <View style={styles.separador} />

      <View style={styles.filaImporte}>
        <Text style={styles.secundario}>
          Precio con IGV
        </Text>

        <Text style={styles.importe}>
          {soles(precio)}
        </Text>
      </View>

      {!!item.codigoCupon && (
        <View style={styles.cuponAplicado}>
          <Icon
            source="ticket-percent-outline"
            size={19}
            color={COLORES.correcto}
          />

          <Text style={styles.cuponTexto}>
            {item.codigoCupon} · −{item.porcentaje}%
          </Text>
        </View>
      )}

      <FilaImporte
        titulo="Total del boleto"
        valor={soles(precio - descuento)}
      />

      <Button
        icon="ticket-percent-outline"
        textColor={COLORES.doradoClaro}
        disabled={bloqueado}
        onPress={() =>
          setMostrarCupon((actual) => !actual)
        }
        style={styles.botonCupon}
      >
        {mostrarCupon
          ? "Ocultar código"
          : "Tengo un cupón"}
      </Button>

      {mostrarCupon && (
        <View>
          <TextInput
            mode="outlined"
            label="Código de descuento"
            placeholder="Escribe tu código"
            value={codigo}
            onChangeText={setCodigo}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={64}
            disabled={bloqueado}
            textColor={COLORES.crema}
            outlineColor={COLORES.bordeInput}
            activeOutlineColor={COLORES.dorado}
            style={styles.input}
          />

          <View style={styles.filaFlexible}>
            <Button
              mode="outlined"
              icon="check"
              textColor={COLORES.doradoClaro}
              disabled={
                bloqueado || !codigo.trim()
              }
              onPress={() => aplicar(codigo)}
            >
              Aplicar
            </Button>

            {!!item.codigoCupon && (
              <Button
                textColor={COLORES.error}
                disabled={bloqueado}
                onPress={() =>
                  cambiar({
                    codigoCupon: null,
                    porcentaje: 0,
                  })
                }
              >
                Quitar cupón
              </Button>
            )}
          </View>

          <Text style={styles.nota}>
            Se consumirá únicamente al confirmar
            una compra válida.
          </Text>
        </View>
      )}
    </View>
  );
}

function MetodoPago({
  nombre,
  subtitulo,
  color,
  colorTexto,
  seleccionado,
  bloqueado,
  onPress,
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{
        selected: seleccionado,
        disabled: bloqueado,
      }}
      accessibilityLabel={`Pagar con ${nombre}, simulación`}
      disabled={bloqueado}
      onPress={onPress}
      style={[
        styles.metodo,
        seleccionado && styles.metodoSeleccionado,
      ]}
    >
      <View
        style={[
          styles.marcaPago,
          { backgroundColor: color },
        ]}
      >
        <Text
          style={[
            styles.nombreMarca,
            { color: colorTexto },
          ]}
        >
          {nombre}
        </Text>
      </View>

      <View style={styles.flex}>
        <Text style={styles.boletoTitulo}>
          {nombre}
        </Text>

        <Text style={styles.nota}>
          {subtitulo}
        </Text>
      </View>

      <Icon
        source={
          seleccionado
            ? "radiobox-marked"
            : "radiobox-blank"
        }
        size={25}
        color={
          seleccionado
            ? COLORES.dorado
            : COLORES.textoSecundario
        }
      />
    </Pressable>
  );
}

export default function Entradas({ navigation }) {
  const { cuenta } = useAuth();

  if (!cuenta) {
    return (
      <View style={styles.centro}>
        <Icon
          source="account-lock-outline"
          size={42}
          color={COLORES.dorado}
        />

        <Text style={styles.texto}>
          Inicia sesión para consultar tus entradas.
        </Text>
      </View>
    );
  }

  return (
    <ContenidoEntradas
      key={cuenta.uid}
      uid={cuenta.uid}
      navigation={navigation}
    />
  );
}

function ContenidoEntradas({ uid, navigation }) {
  const insets = useSafeAreaInsets();

  const clave = `@inkapark/carrito/v1/${uid}`;

  const [datos, setDatos] = useState(inicial);
  const datosRef = useRef(datos);

  const [fechaTexto, setFechaTexto] =
    useState(hoyLima);

  const [listo, setListo] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  const bloqueo = useRef(false);

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  const [pestana, setPestana] =
    useState("comprar");

  const [etapa, setEtapa] =
    useState("armar");

  const [metodo, setMetodo] = useState(null);

  const [aforo, setAforo] = useState(null);
  const [errorAforo, setErrorAforo] =
    useState("");

  const [intentoAforo, setIntentoAforo] =
    useState(0);

  const [intentoCarga, setIntentoCarga] =
    useState(0);

  const [boletos, setBoletos] = useState([]);
  const [cargandoBoletos, setCargandoBoletos] =
    useState(true);

  const [errorBoletos, setErrorBoletos] =
    useState("");

  const [intentoBoletos, setIntentoBoletos] =
    useState(0);

  function informar(texto, error = false) {
    setMensaje(texto);
    setEsError(error);
  }

  useEffect(() => {
    let activo = true;

    async function cargar() {
      setListo(false);

      try {
        const texto = await AsyncStorage.getItem(clave);

        let restaurado = inicial();

        if (texto) {
          const guardado = JSON.parse(texto);

          const valido =
            guardado &&
            fechaValida(guardado.fecha) &&
            Array.isArray(guardado.items) &&
            guardado.items.every(
              (item) =>
                item &&
                typeof item.id === "string" &&
                ["menor", "adulto"].includes(item.tipo) &&
                typeof item.seleccionado === "boolean" &&
                (
                  item.porcentaje == null ||
                  [0, 10, 25].includes(item.porcentaje)
                )
            ) &&
            new Set(
              guardado.items.map((item) => item.id)
            ).size === guardado.items.length;

          if (!valido) {
            throw new Error(
              "No pudimos leer el carrito guardado."
            );
          }

          restaurado = {
            ...inicial(),
            ...guardado,
          };

          if (
            restaurado.pendiente &&
            (
              typeof restaurado.pendiente.operacionId !==
                "string" ||
              !Array.isArray(
                restaurado.pendiente.items
              )
            )
          ) {
            throw new Error(
              "La compra pendiente necesita revisión."
            );
          }
        }

        if (!activo) return;

        datosRef.current = restaurado;
        setDatos(restaurado);
        setFechaTexto(restaurado.fecha);
        setListo(true);

        if (restaurado.pendiente) {
          setMetodo(
            restaurado.pendiente.metodo
          );

          setEtapa("revisar");
        }

        setMensaje("");
      } catch (error) {
        if (!activo) return;

        setMensaje(
          `${error.message} Tus datos no se sobrescribieron.`
        );

        setEsError(true);
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [clave, intentoCarga]);

  useEffect(() => {
    if (!listo) return;

    setAforo(null);
    setErrorAforo("");

    return onSnapshot(
      doc(db, "aforos", datos.fecha),
      { includeMetadataChanges: true },
      (snapshot) => {
        if (snapshot.metadata.fromCache) {
          setAforo(null);

          setErrorAforo(
            "Esperando conexión para confirmar el aforo."
          );

          return;
        }

        const vendidos = snapshot.exists()
          ? snapshot.data().vendidos
          : 0;

        if (
          !Number.isInteger(vendidos) ||
          vendidos < 0 ||
          vendidos > 100
        ) {
          setAforo(null);

          setErrorAforo(
            "No se pudo verificar el aforo."
          );

          return;
        }

        setAforo(100 - vendidos);
        setErrorAforo("");
      },
      () => {
        setAforo(null);

        setErrorAforo(
          "No pudimos consultar los cupos. Revisa tu conexión."
        );
      }
    );
  }, [
    listo,
    datos.fecha,
    intentoAforo,
  ]);

  useEffect(() => {
    setCargandoBoletos(true);

    const consulta = query(
      collection(db, "boletos"),
      where("uid", "==", uid)
    );

    return onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs
          .map((documento) => ({
            ...documento.data(),
            id: documento.id,
          }))
          .sort((a, b) =>
            b.fecha.localeCompare(a.fecha)
          );

        setBoletos(lista);
        setErrorBoletos("");
        setCargandoBoletos(false);
      },
      () => {
        setErrorBoletos(
          "No pudimos cargar tus boletos."
        );

        setCargandoBoletos(false);
      }
    );
  }, [uid, intentoBoletos]);

  async function guardar(nuevo) {
    await AsyncStorage.setItem(
      clave,
      JSON.stringify(nuevo)
    );

    datosRef.current = nuevo;
    setDatos(nuevo);
  }

  async function ejecutar(accion) {
    if (bloqueo.current || !listo) return;

    bloqueo.current = true;
    setOcupado(true);
    informar("");

    try {
      await accion();
    } catch (error) {
      informar(
        error.message ||
          "No se pudo completar la operación.",
        true
      );
    } finally {
      bloqueo.current = false;
      setOcupado(false);
    }
  }

  function editar(transformar) {
    ejecutar(async () => {
      const actual = datosRef.current;

      if (actual.pendiente) {
        throw new Error(
          "Primero recupera el resultado de la compra pendiente."
        );
      }

      await guardar(transformar(actual));
    });
  }

  function cambiarFecha(fecha) {
    if (
      !fechaValida(fecha) ||
      fecha < hoyLima()
    ) {
      informar(
        "Introduce una fecha válida desde hoy, con formato AAAA-MM-DD.",
        true
      );

      return;
    }

    editar((actual) => ({
      ...actual,
      fecha,
      items: actual.items.map((item) => ({
        ...item,
        codigoCupon: null,
        porcentaje: 0,
      })),
    }));
  }

  function agregar(tipo) {
    editar((actual) => {
      if (
        actual.items.length >= MAX_BOLETOS
      ) {
        throw new Error(
          `El máximo es ${MAX_BOLETOS} boletos por compra.`
        );
      }

      return {
        ...actual,
        items: [
          ...actual.items,
          {
            id: Crypto.randomUUID(),
            tipo,
            seleccionado: true,
            codigoCupon: null,
            porcentaje: 0,
          },
        ],
      };
    });
  }

  function quitarTipo(tipo) {
    editar((actual) => {
      const ultimo = [...actual.items]
        .reverse()
        .find((item) => item.tipo === tipo);

      if (!ultimo) return actual;

      return {
        ...actual,
        items: actual.items.filter(
          (item) => item.id !== ultimo.id
        ),
      };
    });
  }

  function cambiarItem(id, cambios) {
    editar((actual) => ({
      ...actual,
      items: actual.items.map((item) =>
        item.id === id
          ? { ...item, ...cambios }
          : item
      ),
    }));
  }

  function eliminarItem(id) {
    Alert.alert(
      "Eliminar boleto",
      "Se quitará del carrito. Si tiene un cupón, seguirá disponible en tu cuenta.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () =>
            editar((actual) => ({
              ...actual,
              items: actual.items.filter(
                (item) => item.id !== id
              ),
            })),
        },
      ]
    );
  }

  function vaciar() {
    Alert.alert(
      "Vaciar carrito",
      "¿Quieres quitar todos los boletos del carrito?",
      [
        {
          text: "Conservar",
          style: "cancel",
        },
        {
          text: "Vaciar",
          style: "destructive",
          onPress: () =>
            editar((actual) => ({
              ...actual,
              items: [],
            })),
        },
      ]
    );
  }

  function aplicarCupon(id, codigo) {
    ejecutar(async () => {
      const actual = datosRef.current;

      if (actual.pendiente) {
        throw new Error(
          "Hay una compra pendiente."
        );
      }

      const resultado = await consultarCupon(
        codigo,
        actual.fecha
      );

      if (
        actual.items.some(
          (item) =>
            item.id !== id &&
            item.codigoCupon === resultado.codigo
        )
      ) {
        throw new Error(
          "Ese cupón ya está asignado a otro boleto."
        );
      }

      await guardar({
        ...actual,
        items: actual.items.map((item) =>
          item.id === id
            ? {
                ...item,
                codigoCupon: resultado.codigo,
                porcentaje: resultado.porcentaje,
              }
            : item
        ),
      });

      informar("Cupón aplicado al boleto.");
    });
  }

  function abrirPago() {
    const actual = datosRef.current;
    const calculoActual = resumen(actual.items);

    if (
      !fechaValida(actual.fecha) ||
      actual.fecha < hoyLima()
    ) {
      informar(
        "Elige una fecha de visita válida.",
        true
      );
      return;
    }

    if (
      calculoActual.cantidad < 1 ||
      calculoActual.cantidad > MAX_BOLETOS
    ) {
      informar(
        `Selecciona entre 1 y ${MAX_BOLETOS} boletos.`,
        true
      );
      return;
    }

    if (
      aforo === null ||
      calculoActual.cantidad > aforo
    ) {
      informar(
        "Comprueba que haya cupos suficientes.",
        true
      );
      return;
    }

    informar("");
    setMetodo(null);
    setEtapa("revisar");
  }

  function volverAlCarrito() {
    if (bloqueo.current) return;

    if (datosRef.current.pendiente) {
      informar(
        "Primero recupera el resultado pendiente. No se iniciará otra compra.",
        true
      );

      return;
    }

    informar("");
    setEtapa("armar");
  }

  function pagar() {
    ejecutar(async () => {
      let actual = datosRef.current;

      if (!actual.pendiente && !metodo) {
        throw new Error(
          "Selecciona Yape o Plin."
        );
      }

      const peticion =
        actual.pendiente || {
          operacionId: Crypto.randomUUID(),
          fecha: actual.fecha,
          metodo,
          items: actual.items
            .filter(
              (item) => item.seleccionado
            )
            .map((item) => ({
              id: item.id,
              tipo: item.tipo,
              codigoCupon: item.codigoCupon,
            })),
        };

      if (!actual.pendiente) {
        actual = {
          ...actual,
          pendiente: peticion,
        };

        await guardar(actual);
      }

      let compra;

      try {
        compra = await confirmarCompra(
          peticion
        );
      } catch (error) {
        const definitivos = [
          "functions/invalid-argument",
          "functions/failed-precondition",
          "functions/not-found",
          "functions/permission-denied",
          "functions/unauthenticated",
          "functions/already-exists",
        ];

        if (
          definitivos.includes(error.code)
        ) {
          await guardar({
            ...actual,
            pendiente: null,
          });
        }

        throw error;
      }

      const comprados = new Set(
        peticion.items.map(
          (item) => item.id
        )
      );

      // Si falla el guardado local tras confirmarse en nube,
      // se conserva el intento para recuperar la misma compra.
      try {
        await guardar({
          ...actual,
          items: actual.items.filter(
            (item) =>
              !comprados.has(item.id)
          ),
          pendiente: null,
          ultimaCompra: compra,
        });
      } catch {
        throw new Error(
          "La compra se confirmó en Firebase, pero no pudimos actualizar el carrito del teléfono. Pulsa Recuperar resultado para sincronizarlo sin duplicar boletos."
        );
      }

      informar("");
      setMetodo(null);
      setEtapa("exito");
    });
  }

  function irABoletos() {
    if (bloqueo.current) return;

    setEtapa("armar");
    setPestana("boletos");
    informar("");
  }

  const bloqueado =
    !listo ||
    ocupado ||
    !!datos.pendiente;

  const calculo = resumen(datos.items);

  const seleccionados = datos.items.filter(
    (item) => item.seleccionado
  );

  const compra = datos.ultimaCompra;

  const metodoActual =
    datos.pendiente?.metodo || metodo;

  const puedeContinuar =
    !bloqueado &&
    calculo.cantidad > 0 &&
    calculo.cantidad <= MAX_BOLETOS &&
    datos.fecha >= hoyLima() &&
    aforo !== null &&
    calculo.cantidad <= aforo;

  const puedeConfirmar =
    !ocupado &&
    listo &&
    (
      !!datos.pendiente ||
      (
        !!metodoActual &&
        calculo.cantidad > 0 &&
        calculo.cantidad <= MAX_BOLETOS &&
        aforo !== null &&
        calculo.cantidad <= aforo &&
        datos.fecha >= hoyLima()
      )
    );

  return (
    <View style={styles.pantalla}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.contenido,
          {
            paddingTop: Math.max(
              insets.top,
              18
            ),
          },
        ]}
      >
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

            <Text style={styles.marcaSubtitulo}>
              TU PRÓXIMA AVENTURA
            </Text>
          </View>

          <View style={styles.iconoCabecera}>
            <Icon
              source="ticket-confirmation-outline"
              size={27}
              color={COLORES.doradoClaro}
            />
          </View>
        </View>

        <Text style={styles.tituloPagina}>
          Vive la experiencia
        </Text>

        <Text style={styles.descripcionPagina}>
          Elige tu visita y lleva tus boletos contigo.
        </Text>

        <View style={styles.pestanas}>
          {[
            {
              id: "comprar",
              texto: "Comprar",
              icono: "cart-outline",
            },
            {
              id: "boletos",
              texto: "Mis boletos",
              icono: "qrcode",
            },
          ].map((opcion) => {
            const activa =
              pestana === opcion.id;

            return (
              <Pressable
                key={opcion.id}
                accessibilityRole="tab"
                accessibilityState={{
                  selected: activa,
                }}
                disabled={
                  ocupado ||
                  !!datos.pendiente
                }
                onPress={() => {
                  setPestana(opcion.id);
                  setEtapa("armar");
                  informar("");
                }}
                style={[
                  styles.pestana,
                  activa &&
                    styles.pestanaActiva,
                ]}
              >
                <Icon
                  source={opcion.icono}
                  size={20}
                  color={
                    activa
                      ? COLORES.botonTexto
                      : COLORES.textoSecundario
                  }
                />

                <Text
                  style={[
                    styles.pestanaTexto,
                    activa && {
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

        {etapa !== "revisar" && (
          <Aviso
            texto={mensaje}
            error={esError}
          />
        )}

        {!listo && (
          <View style={styles.panel}>
            <ActivityIndicator
              color={COLORES.dorado}
            />

            <Text style={styles.textoCentrado}>
              Preparando tu carrito…
            </Text>

            {!!mensaje && (
              <Button
                textColor={COLORES.doradoClaro}
                onPress={() =>
                  setIntentoCarga(
                    (valor) => valor + 1
                  )
                }
              >
                Reintentar carga
              </Button>
            )}
          </View>
        )}

        {listo &&
          pestana === "comprar" &&
          etapa === "armar" && (
            <>
              <View style={styles.panel}>
                <EncabezadoSeccion
                  icono="calendar-month-outline"
                  titulo="1. Elige tu visita"
                  descripcion="Los cupos corresponden al día que visitarás el parque."
                />

                <TextInput
                  mode="outlined"
                  label="Fecha · AAAA-MM-DD"
                  value={fechaTexto}
                  onChangeText={setFechaTexto}
                  maxLength={10}
                  autoCorrect={false}
                  disabled={bloqueado}
                  textColor={COLORES.crema}
                  outlineColor={COLORES.bordeInput}
                  activeOutlineColor={COLORES.dorado}
                  style={styles.input}
                  left={
                    <TextInput.Icon
                      icon="calendar-outline"
                    />
                  }
                />

                <View style={styles.filaFlexible}>
                  <Button
                    icon="check"
                    mode="outlined"
                    textColor={COLORES.doradoClaro}
                    disabled={bloqueado}
                    onPress={() =>
                      cambiarFecha(
                        fechaTexto.trim()
                      )
                    }
                  >
                    Aplicar fecha
                  </Button>

                  <Button
                    icon="calendar-today"
                    textColor={COLORES.doradoClaro}
                    disabled={bloqueado}
                    onPress={() => {
                      const hoy = hoyLima();
                      setFechaTexto(hoy);
                      cambiarFecha(hoy);
                    }}
                  >
                    Hoy
                  </Button>
                </View>

                <View style={styles.aforo}>
                  <Icon
                    source="account-group-outline"
                    size={28}
                    color={
                      aforo === 0
                        ? COLORES.error
                        : COLORES.doradoClaro
                    }
                  />

                  <View style={styles.flex}>
                    <Text style={styles.boletoTitulo}>
                      {fechaBonita(datos.fecha)}
                    </Text>

                    <Text style={styles.secundario}>
                      {aforo === null
                        ? "Consultando disponibilidad…"
                        : aforo === 0
                        ? "Sin cupos disponibles"
                        : `${aforo} cupos disponibles de 100`}
                    </Text>
                  </View>

                  {aforo === null && (
                    <ActivityIndicator
                      size="small"
                      color={COLORES.dorado}
                    />
                  )}
                </View>

                <Aviso
                  texto={errorAforo}
                  error
                />

                {!!errorAforo && (
                  <Button
                    icon="refresh"
                    textColor={COLORES.doradoClaro}
                    onPress={() =>
                      setIntentoAforo(
                        (valor) => valor + 1
                      )
                    }
                  >
                    Actualizar disponibilidad
                  </Button>
                )}
              </View>

              <View style={styles.panel}>
                <EncabezadoSeccion
                  icono="ticket-outline"
                  titulo="2. Agrega tus entradas"
                  descripcion={`Hasta ${MAX_BOLETOS} boletos por compra. Precios con IGV incluido.`}
                />

                {["menor", "adulto"].map(
                  (tipo) => (
                    <ContadorTipo
                      key={tipo}
                      tipo={tipo}
                      cantidad={
                        datos.items.filter(
                          (item) =>
                            item.tipo === tipo
                        ).length
                      }
                      bloqueado={bloqueado}
                      puedeAgregar={
                        datos.items.length <
                        MAX_BOLETOS
                      }
                      agregar={() =>
                        agregar(tipo)
                      }
                      quitar={() =>
                        quitarTipo(tipo)
                      }
                    />
                  )
                )}
              </View>

              {!!datos.items.length && (
                <>
                  <EncabezadoSeccion
                    icono="ticket-percent-outline"
                    titulo="3. Revisa tus boletos"
                    descripcion="Marca cuáles comprarás y aplica un cupón por boleto si tienes uno."
                  />

                  {datos.items.map(
                    (item, indice) => (
                      <BoletoCarrito
                        key={item.id}
                        item={item}
                        numero={indice + 1}
                        bloqueado={bloqueado}
                        cambiar={(cambios) =>
                          cambiarItem(
                            item.id,
                            cambios
                          )
                        }
                        eliminar={() =>
                          eliminarItem(item.id)
                        }
                        aplicar={(codigo) =>
                          aplicarCupon(
                            item.id,
                            codigo
                          )
                        }
                      />
                    )
                  )}

                  <Button
                    icon="delete-sweep-outline"
                    textColor={COLORES.error}
                    disabled={bloqueado}
                    onPress={vaciar}
                  >
                    Vaciar carrito
                  </Button>
                </>
              )}

              {!datos.items.length && (
                <View style={styles.vacio}>
                  <Icon
                    source="cart-outline"
                    size={45}
                    color={COLORES.dorado}
                  />

                  <Text style={styles.tipoNombre}>
                    Tu aventura comienza aquí
                  </Text>

                  <Text style={styles.textoCentrado}>
                    Utiliza los botones + para agregar
                    entradas al carrito.
                  </Text>
                </View>
              )}

              <View style={styles.panel}>
                <View style={styles.filaImporte}>
                  <View>
                    <Text style={styles.secundario}>
                      {calculo.cantidad} boleto(s)
                      seleccionado(s)
                    </Text>

                    <Text style={styles.totalImporte}>
                      {soles(calculo.total)}
                    </Text>
                  </View>

                  <Icon
                    source="cart-check"
                    size={30}
                    color={COLORES.dorado}
                  />
                </View>

                {calculo.descuento > 0 && (
                  <Text style={styles.cuponTexto}>
                    Ahorras{" "}
                    {soles(calculo.descuento)}
                  </Text>
                )}

                <Button
                  mode="contained"
                  icon="arrow-right"
                  buttonColor={COLORES.boton}
                  textColor={COLORES.botonTexto}
                  disabled={!puedeContinuar}
                  loading={ocupado}
                  onPress={abrirPago}
                  contentStyle={styles.botonPrincipal}
                  style={styles.botonRedondo}
                >
                  Continuar al pago
                </Button>

                <Text style={styles.notaCentrada}>
                  Los cupos se descuentan al confirmar.
                </Text>
              </View>
            </>
          )}

        {pestana === "comprar" &&
          etapa === "revisar" && (
            <View style={styles.vacio}>
              <Icon
                source="receipt-text-check-outline"
                size={48}
                color={COLORES.dorado}
              />

              <Text style={styles.tipoNombre}>
                Revisa tu compra
              </Text>

              <Text style={styles.textoCentrado}>
                Tu resumen y los métodos de pago
                están en la ventana de confirmación.
              </Text>
            </View>
          )}

        {pestana === "comprar" &&
          etapa === "exito" &&
          !!compra && (
            <View style={styles.panel}>
              <View style={styles.exitoIcono}>
                <Icon
                  source="check"
                  size={44}
                  color={COLORES.correcto}
                />
              </View>

              <Text style={styles.tituloExito}>
                ¡Tu aventura está lista!
              </Text>

              <Text style={styles.textoCentrado}>
                Tus boletos quedaron registrados
                en Firebase.
              </Text>

              <Aviso texto="Compra demostrativa. No se realizó ningún cobro." />

              <View style={styles.detalleCompra}>
                <Text style={styles.secundario}>
                  Fecha de visita
                </Text>

                <Text style={styles.boletoTitulo}>
                  {fechaBonita(compra.fecha)}
                </Text>

                <Text style={styles.secundario}>
                  Método:{" "}
                  {compra.metodo.toUpperCase()}
                </Text>

                <Text style={styles.secundario}>
                  Boletos: {compra.boletos.length}
                </Text>

                <Text
                  selectable
                  style={styles.codigoCompra}
                >
                  Compra: {compra.id}
                </Text>
              </View>

              <ResumenImportes datos={compra} />

              <Button
                mode="contained"
                icon="qrcode"
                buttonColor={COLORES.boton}
                textColor={COLORES.botonTexto}
                onPress={irABoletos}
                contentStyle={styles.botonPrincipal}
                style={styles.botonRedondo}
              >
                Ver mis boletos y QR
              </Button>

              <Button
                icon="cart-plus"
                textColor={COLORES.doradoClaro}
                onPress={() => {
                  setEtapa("armar");
                  informar("");
                }}
              >
                Preparar otra visita
              </Button>
            </View>
          )}

        {pestana === "boletos" && (
          <>
            <EncabezadoSeccion
              icono="qrcode"
              titulo="Tus accesos al parque"
              descripcion="Abre un boleto para ver su QR, imprimirlo o compartir su PDF."
            />

            {cargandoBoletos && (
              <ActivityIndicator
                color={COLORES.dorado}
                style={styles.cargando}
              />
            )}

            <Aviso
              texto={errorBoletos}
              error
            />

            {!!errorBoletos && (
              <Button
                icon="refresh"
                textColor={COLORES.doradoClaro}
                onPress={() =>
                  setIntentoBoletos(
                    (valor) => valor + 1
                  )
                }
              >
                Reintentar
              </Button>
            )}

            {!cargandoBoletos &&
              !errorBoletos &&
              !boletos.length && (
                <View style={styles.vacio}>
                  <Icon
                    source="ticket-outline"
                    size={48}
                    color={COLORES.dorado}
                  />

                  <Text style={styles.tipoNombre}>
                    Aún no tienes boletos
                  </Text>

                  <Text style={styles.textoCentrado}>
                    Cuando confirmes una compra,
                    tus accesos aparecerán aquí.
                  </Text>

                  <Button
                    textColor={COLORES.doradoClaro}
                    onPress={() =>
                      setPestana("comprar")
                    }
                  >
                    Comprar entradas
                  </Button>
                </View>
              )}

            {boletos.map((boleto) => {
              const estado =
                estadoBoleto(boleto);

              const activo =
                estado === "activa";

              return (
                <View
                  key={boleto.id}
                  style={styles.panel}
                >
                  <View style={styles.fila}>
                    <View style={styles.iconoTipo}>
                      <Icon
                        source={
                          TIPOS[boleto.tipo]?.icono ||
                          "ticket-outline"
                        }
                        size={28}
                        color={COLORES.dorado}
                      />
                    </View>

                    <View style={styles.flex}>
                      <Text style={styles.tipoNombre}>
                        Entrada{" "}
                        {TIPOS[boleto.tipo]?.nombre ||
                          boleto.tipo}
                      </Text>

                      <Text style={styles.secundario}>
                        {fechaBonita(boleto.fecha)}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.estado,
                        activo &&
                          styles.estadoActivo,
                      ]}
                    >
                      <Text
                        style={[
                          styles.estadoTexto,
                          activo && {
                            color: COLORES.correcto,
                          },
                        ]}
                      >
                        {activo
                          ? "Vigente"
                          : estado === "usada"
                          ? "Utilizada"
                          : "Expirada"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.separador} />

                  <FilaImporte
                    titulo="Importe con IGV"
                    valor={soles(boleto.total)}
                  />

                  <Button
                    mode="outlined"
                    icon="qrcode"
                    textColor={COLORES.doradoClaro}
                    onPress={() =>
                      navigation.navigate(
                        "DetalleEntrada",
                        {
                          boletoId: boleto.id,
                        }
                      )
                    }
                    style={styles.botonRedondo}
                  >
                    Ver QR y opciones de impresión
                  </Button>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      <Modal
        visible={etapa === "revisar"}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={volverAlCarrito}
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
          style={styles.modalFondo}
        >
          <View
            accessibilityViewIsModal
            style={[
              styles.modalPanel,
              {
                paddingBottom: Math.max(
                  insets.bottom,
                  18
                ),
              },
            ]}
          >
            <View style={styles.modalIndicador} />

            <View style={styles.modalCabecera}>
              <View style={styles.flex}>
                <Text style={styles.modalTitulo}>
                  Confirma tu visita
                </Text>

                <Text style={styles.secundario}>
                  Resumen y método de pago
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Volver al carrito"
                disabled={
                  ocupado ||
                  !!datos.pendiente
                }
                onPress={volverAlCarrito}
                style={[
                  styles.botonIcono,
                  (
                    ocupado ||
                    !!datos.pendiente
                  ) && styles.deshabilitado,
                ]}
              >
                <Icon
                  source="close"
                  size={25}
                  color={COLORES.crema}
                />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={
                styles.modalContenido
              }
            >
              <Aviso
                texto={mensaje}
                error={esError}
              />

              <View style={styles.fechaResumen}>
                <Icon
                  source="calendar-check-outline"
                  size={25}
                  color={COLORES.dorado}
                />

                <View>
                  <Text style={styles.nota}>
                    Tu visita
                  </Text>

                  <Text style={styles.boletoTitulo}>
                    {fechaBonita(datos.fecha)}
                  </Text>
                </View>
              </View>

              {seleccionados.map(
                (item, indice) => {
                  const descuento = Math.round(
                    PRECIOS[item.tipo] *
                    (item.porcentaje || 0) /
                    100
                  );

                  return (
                    <View
                      key={item.id}
                      style={styles.lineaResumen}
                    >
                      <Icon
                        source={TIPOS[item.tipo].icono}
                        size={23}
                        color={COLORES.doradoClaro}
                      />

                      <View style={styles.flex}>
                        <Text style={styles.boletoTitulo}>
                          Boleto {indice + 1} ·{" "}
                          {TIPOS[item.tipo].nombre}
                        </Text>

                        {!!item.codigoCupon && (
                          <Text style={styles.cuponTexto}>
                            Cupón −{item.porcentaje}%
                          </Text>
                        )}
                      </View>

                      <Text style={styles.importe}>
                        {soles(
                          PRECIOS[item.tipo] -
                          descuento
                        )}
                      </Text>
                    </View>
                  );
                }
              )}

              <ResumenImportes datos={calculo} />

              <Text style={styles.nota}>
                El IGV ya está incluido en los
                precios y en el total.
              </Text>

              <View style={styles.separador} />

              <EncabezadoSeccion
                icono="wallet-outline"
                titulo="Elige cómo pagar"
                descripcion="Selecciona una opción para confirmar la simulación."
              />

              <MetodoPago
                nombre="Yape"
                subtitulo="Simulación de pago"
                color="#742384"
                colorTexto="#FFFFFF"
                seleccionado={
                  metodoActual === "yape"
                }
                bloqueado={
                  ocupado ||
                  !!datos.pendiente
                }
                onPress={() =>
                  setMetodo("yape")
                }
              />

              <MetodoPago
                nombre="Plin"
                subtitulo="Simulación de pago"
                color="#00C3C9"
                colorTexto="#073F78"
                seleccionado={
                  metodoActual === "plin"
                }
                bloqueado={
                  ocupado ||
                  !!datos.pendiente
                }
                onPress={() =>
                  setMetodo("plin")
                }
              />

              {datos.pendiente ? (
                <Aviso texto="Hay una solicitud pendiente. Recuperaremos su resultado antes de permitir otra compra." />
              ) : (
                <Aviso
                  texto={
                    aforo === null
                      ? "Esperando conexión para verificar los cupos."
                      : `Cupos disponibles: ${aforo}. Se comprobarán nuevamente al confirmar.`
                  }
                  error={
                    aforo !== null &&
                    calculo.cantidad > aforo
                  }
                />
              )}

              <Button
                mode="contained"
                icon={
                  datos.pendiente
                    ? "refresh"
                    : "check-circle-outline"
                }
                loading={ocupado}
                disabled={!puedeConfirmar}
                onPress={pagar}
                buttonColor={COLORES.boton}
                textColor={COLORES.botonTexto}
                contentStyle={styles.botonPrincipal}
                style={styles.botonRedondo}
              >
                {ocupado
                  ? "Confirmando…"
                  : datos.pendiente
                  ? "Recuperar resultado"
                  : `Confirmar · ${soles(calculo.total)}`}
              </Button>

              {!datos.pendiente && (
                <Button
                  icon="arrow-left"
                  textColor={COLORES.doradoClaro}
                  disabled={ocupado}
                  onPress={volverAlCarrito}
                >
                  Volver y editar boletos
                </Button>
              )}

              <Text style={styles.notaCentrada}>
                No cierres la app mientras se confirma.
                Si pierdes conexión, podrás recuperar
                el resultado sin duplicar la compra.
              </Text>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: COLORES.fondo,
  },

  contenido: {
    paddingHorizontal: 18,
    paddingBottom: 32,
    gap: 15,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },

  flex: {
    flex: 1,
  },

  centro: {
    flex: 1,
    backgroundColor: COLORES.fondo,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },

  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },

  logo: {
    width: 62,
    height: 48,
  },

  marca: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 20,
    letterSpacing: 2,
  },

  marcaSubtitulo: {
    color: COLORES.doradoClaro,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 4,
  },

  iconoCabecera: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#30200F",
    alignItems: "center",
    justifyContent: "center",
  },

  tituloPagina: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 27,
    fontWeight: "bold",
    marginTop: 4,
  },

  descripcionPagina: {
    color: COLORES.textoSecundario,
    fontSize: 14,
    lineHeight: 21,
    marginTop: -7,
  },

  pestanas: {
    flexDirection: "row",
    backgroundColor: COLORES.centro,
    borderRadius: 16,
    padding: 5,
    gap: 5,
    borderWidth: 1,
    borderColor: "#493015",
  },

  pestana: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 8,
  },

  pestanaActiva: {
    backgroundColor: COLORES.boton,
  },

  pestanaTexto: {
    color: COLORES.textoSecundario,
    fontWeight: "bold",
    fontSize: 14,
  },

  panel: {
    backgroundColor: "#211309",
    borderRadius: 20,
    padding: 17,
    borderWidth: 1,
    borderColor: "#523719",
    gap: 12,
  },

  encabezadoSeccion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 3,
  },

  iconoSeccion: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#382510",
    justifyContent: "center",
    alignItems: "center",
  },

  tituloSeccion: {
    color: COLORES.crema,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },

  secundario: {
    color: COLORES.textoSecundario,
    fontSize: 13,
    lineHeight: 19,
  },

  texto: {
    color: COLORES.crema,
    fontSize: 14,
    lineHeight: 21,
  },

  textoCentrado: {
    color: COLORES.textoSecundario,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  nota: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    lineHeight: 18,
  },

  notaCentrada: {
    color: COLORES.textoSecundario,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
  },

  input: {
    backgroundColor: "#1B1008",
    marginTop: 4,
  },

  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  filaFlexible: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginVertical: 9,
  },

  aforo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 15,
    backgroundColor: "#30200F",
  },

  tipoCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#2C1B0D",
    gap: 15,
  },

  iconoTipo: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#3B2812",
    alignItems: "center",
    justifyContent: "center",
  },

  tipoNombre: {
    color: COLORES.crema,
    fontSize: 17,
    fontWeight: "bold",
  },

  precio: {
    color: COLORES.doradoClaro,
    fontSize: 18,
    fontWeight: "bold",
  },

  contadorFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },

  contador: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  botonContador: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#493018",
    alignItems: "center",
    justifyContent: "center",
  },

  botonContadorMas: {
    backgroundColor: COLORES.boton,
  },

  numeroContador: {
    color: COLORES.crema,
    fontSize: 20,
    fontWeight: "bold",
    minWidth: 20,
    textAlign: "center",
  },

  deshabilitado: {
    opacity: 0.4,
  },

  boletoCard: {
    backgroundColor: "#24160B",
    borderWidth: 1,
    borderColor: "#735124",
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },

  boletoNoSeleccionado: {
    borderColor: "#44321E",
    backgroundColor: "#1D130B",
  },

  boletoTitulo: {
    color: COLORES.crema,
    fontSize: 15,
    fontWeight: "bold",
    lineHeight: 22,
  },

  botonIcono: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  separador: {
    height: 1,
    backgroundColor: "#50371D",
    marginVertical: 5,
  },

  filaImporte: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    paddingVertical: 5,
  },

  importe: {
    color: COLORES.crema,
    fontSize: 15,
    fontWeight: "bold",
  },

  totalTexto: {
    color: COLORES.crema,
    fontSize: 19,
    fontWeight: "bold",
  },

  totalImporte: {
    color: COLORES.doradoClaro,
    fontSize: 28,
    fontWeight: "bold",
  },

  resumenImportes: {
    paddingVertical: 8,
    gap: 4,
  },

  cuponAplicado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 5,
  },

  cuponTexto: {
    color: COLORES.correcto,
    fontSize: 12,
    lineHeight: 18,
  },

  botonCupon: {
    alignSelf: "flex-start",
  },

  botonPrincipal: {
    minHeight: 52,
  },

  botonRedondo: {
    borderRadius: 14,
    marginTop: 8,
  },

  aviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 13,
    backgroundColor: "#382810",
  },

  avisoError: {
    backgroundColor: "#3B211B",
  },

  avisoTexto: {
    flex: 1,
    color: COLORES.crema,
    fontSize: 13,
    lineHeight: 20,
  },

  vacio: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 18,
    gap: 13,
  },

  cargando: {
    paddingVertical: 24,
  },

  estado: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#433222",
  },

  estadoActivo: {
    backgroundColor: "#253522",
  },

  estadoTexto: {
    color: COLORES.textoSecundario,
    fontSize: 11,
    fontWeight: "bold",
  },

  modalFondo: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.78)",
    paddingTop: 35,
  },

  modalPanel: {
    backgroundColor: "#211309",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "94%",
    width: "100%",
    maxWidth: 640,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#735124",
  },

  modalIndicador: {
    width: 44,
    height: 5,
    backgroundColor: "#735124",
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },

  modalCabecera: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#50371D",
  },

  modalTitulo: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 4,
  },

  modalContenido: {
    padding: 20,
    gap: 13,
  },

  fechaResumen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#30200F",
    padding: 14,
    borderRadius: 14,
  },

  lineaResumen: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },

  metodo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 17,
    backgroundColor: "#2D1C0E",
    borderWidth: 2,
    borderColor: "#50371D",
  },

  metodoSeleccionado: {
    borderColor: COLORES.dorado,
    backgroundColor: "#3B2812",
  },

  marcaPago: {
    width: 66,
    height: 54,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  nombreMarca: {
    fontWeight: "bold",
    fontSize: 20,
  },

  exitoIcono: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#243721",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },

  tituloExito: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
  },

  detalleCompra: {
    backgroundColor: "#2D1C0E",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },

  codigoCompra: {
    color: COLORES.textoSecundario,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 6,
  },
});