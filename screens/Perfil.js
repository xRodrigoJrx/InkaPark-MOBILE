import React, {
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Card,
  Dialog,
  Icon,
  Portal,
  Text,
} from "react-native-paper";

import { useSafeAreaInsets } from
  "react-native-safe-area-context";

import {
  COLORES as C,
  FUENTES,
} from "../src/styles/paleta";

import { useAuth } from
  "../src/context/AuthContext";

import { mensajeAuth } from
  "../src/utils/authErrors";

function OpcionPerfil({
  icono,
  titulo,
  descripcion,
  onPress,
}) {
  return (
    <Card
      mode="outlined"
      style={s.opcion}
      onPress={onPress}
    >
      <View style={s.opcionContenido}>
        <View style={s.iconoOpcion}>
          <Icon
            source={icono}
            size={24}
            color={C.dorado}
          />
        </View>

        <View style={s.flex}>
          <Text style={s.tituloOpcion}>
            {titulo}
          </Text>

          <Text style={s.descripcion}>
            {descripcion}
          </Text>
        </View>

        <Icon
          source={
            onPress
              ? "chevron-right"
              : "lock-outline"
          }
          size={22}
          color={C.textoSecundario}
        />
      </View>
    </Card>
  );
}

export default function Perfil({
  navigation,
}) {
  const { usuario, salir } = useAuth();
  const insets = useSafeAreaInsets();

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [cerrando, setCerrando] =
    useState(false);

  const [error, setError] = useState("");
  const [ayuda, setAyuda] = useState(false);

  const salidaEnCurso = useRef(false);

  async function cerrarSesion() {
    if (salidaEnCurso.current) return;

    salidaEnCurso.current = true;
    setMostrarModal(false);
    setError("");
    setCerrando(true);

    try {
      await salir();
    } catch (e) {
      setError(
        e.code === "notifications/pause-failed"
          ? e.message
          : mensajeAuth(e)
      );
    } finally {
      salidaEnCurso.current = false;
      setCerrando(false);
    }
  }

  if (cerrando) {
    return (
      <View style={s.centro}>
        <ActivityIndicator
          size="large"
          color={C.dorado}
        />

        <Text style={s.texto}>
          Cerrando sesión…
        </Text>
      </View>
    );
  }

  return (
    <View style={s.pantalla}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.contenido,
          {
            paddingTop: Math.max(
              insets.top,
              18
            ),
          },
        ]}
      >
        <View style={s.header}>
          <Image
            source={require("../assets/logo.png")}
            style={s.logo}
            resizeMode="contain"
          />

          <View style={s.flex}>
            <Text style={s.marca}>
              INKAPARK
            </Text>

            <Text style={s.descripcion}>
              AVENTURA, CULTURA Y NATURALEZA
            </Text>
          </View>
        </View>

        <Text style={s.titulo}>
          Mi perfil
        </Text>

        <View style={s.tarjetaUsuario}>
          <View style={s.avatar}>
            <Text style={s.avatarTexto}>
              {usuario?.nombre
                ? usuario.nombre
                    .substring(0, 2)
                    .toUpperCase()
                : "IK"}
            </Text>
          </View>

          <View style={s.flex}>
            <Text style={s.nombre}>
              {usuario?.nombre || "Usuario"}
            </Text>

            <Text style={s.texto}>
              {usuario?.correo || ""}
            </Text>

            {!!usuario?.telefono && (
              <Text style={s.descripcion}>
                {usuario.telefono}
              </Text>
            )}
          </View>
        </View>

        <Text style={s.seccion}>
          TU AVENTURA
        </Text>

        <OpcionPerfil
          icono="ticket-confirmation-outline"
          titulo="Mis entradas"
          descripcion="Boletos, códigos QR e impresión"
          onPress={() =>
            navigation.navigate("Entradas")
          }
        />

        <OpcionPerfil
          icono="shoe-print"
          titulo="Camina y gana"
          descripcion="Tu misión y tienda de puntos"
          onPress={() =>
            navigation.navigate(
              "Camina",
              {
                screen: "MisionCamina",
              }
            )
          }
        />

        <OpcionPerfil
          icono="ticket-percent-outline"
          titulo="Mis cupones"
          descripcion="Códigos disponibles y utilizados"
          onPress={() =>
            navigation.navigate(
              "Camina",
              {
                screen: "MisCupones",
              }
            )
          }
        />

        <Text style={s.seccion}>
          MÁS OPCIONES
        </Text>

        <OpcionPerfil
          icono="heart-outline"
          titulo="Favoritos"
          descripcion="Próximamente"
        />

        <OpcionPerfil
          icono="bell-outline"
          titulo="Notificaciones"
          descripcion="Visitas, espectáculos e hidratación"
          onPress={() =>
            navigation.navigate(
              "Notificaciones"
            )
          }
        />

        <OpcionPerfil
          icono="cog-outline"
          titulo="Configuración"
          descripcion="Próximamente"
        />

        <OpcionPerfil
          icono="help-circle-outline"
          titulo="Ayuda"
          descripcion="Cómo funcionan boletos y recompensas"
          onPress={() =>
            setAyuda(true)
          }
        />

        {!!error && (
          <Text
            accessibilityRole="alert"
            style={s.error}
          >
            {error}
          </Text>
        )}

        <Button
          mode="outlined"
          icon="logout"
          textColor={C.doradoClaro}
          style={s.salir}
          onPress={() =>
            setMostrarModal(true)
          }
        >
          Cerrar sesión
        </Button>
      </ScrollView>

      <Portal>
        <Dialog
          visible={mostrarModal}
          onDismiss={() =>
            setMostrarModal(false)
          }
          style={s.dialogo}
        >
          <Dialog.Title>
            Cerrar sesión
          </Dialog.Title>

          <Dialog.Content>
            <Text style={s.texto}>
              ¿Quieres salir de tu cuenta?
              Tus compras, premios y cupones
              seguirán en ella. Los recordatorios
              de este teléfono quedarán pausados.
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setMostrarModal(false)
              }
            >
              Cancelar
            </Button>

            <Button onPress={cerrarSesion}>
              Salir
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={ayuda}
          onDismiss={() =>
            setAyuda(false)
          }
          style={s.dialogo}
        >
          <Dialog.Title>
            Tu aventura en InkaPark
          </Dialog.Title>

          <Dialog.Content>
            <Text style={s.texto}>
              • Los boletos permiten un ingreso
              en la fecha indicada.
              {"\n\n"}
              • Camina 325 metros válidos para
              obtener hasta 325 puntos.
              {"\n\n"}
              • Canjea cada recompensa una sola vez.
              {"\n\n"}
              • El cupón se consume al confirmar
              una compra, no al introducir su código.
              {"\n\n"}
              • Los pagos son demostrativos.
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={() =>
                setAyuda(false)
              }
            >
              Entendido
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: C.fondo,
  },

  contenido: {
    paddingHorizontal: 18,
    paddingBottom: 40,
    gap: 13,
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 8,
  },

  logo: {
    width: 59,
    height: 55,
  },

  marca: {
    color: C.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 21,
    letterSpacing: 2,
  },

  titulo: {
    color: C.crema,
    fontFamily: FUENTES.principal,
    fontWeight: "bold",
    fontSize: 29,
  },

  seccion: {
    color: C.doradoClaro,
    fontSize: 11,
    letterSpacing: 1.4,
    fontWeight: "bold",
    marginTop: 13,
  },

  tarjetaUsuario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 19,
    borderWidth: 1,
    borderColor: C.bordeTarjeta,
    borderRadius: 21,
    backgroundColor: "#2D1C0E",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.dorado,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarTexto: {
    color: C.fondo,
    fontWeight: "bold",
    fontSize: 22,
  },

  nombre: {
    color: C.crema,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  texto: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
  },

  descripcion: {
    color: C.textoSecundario,
    fontSize: 11,
    lineHeight: 18,
    marginTop: 4,
  },

  opcion: {
    backgroundColor: "#24160B",
    borderColor: "#62451F",
    borderRadius: 16,
  },

  opcionContenido: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 12,
  },

  iconoOpcion: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#382510",
    alignItems: "center",
    justifyContent: "center",
  },

  tituloOpcion: {
    color: C.crema,
    fontSize: 15,
    fontWeight: "bold",
  },

  salir: {
    borderColor: C.bordeTarjeta,
    borderRadius: 14,
    marginTop: 17,
  },

  error: {
    color: C.error,
    fontSize: 13,
    lineHeight: 21,
  },

  dialogo: {
    backgroundColor: "#24160B",
  },

  centro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    backgroundColor: C.fondo,
  },
});