import React from "react";

import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Icon,
  Modal,
  Portal,
  Text,
} from "react-native-paper";

import Inicio from "./Inicio";

import { useCamina } from
  "../src/context/CaminaContext";

import { COLORES as C } from
  "../src/styles/paleta";

export default function InicioConMision(props) {
  const m = useCamina();

  function irAMision() {
    m.cerrarInvitacion();

    props.navigation
      .getParent()
      ?.navigate("Camina");
  }

  return (
    <View style={s.base}>
      <Inicio {...props} />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir Camina y gana"
        onPress={irAMision}
        style={s.acceso}
      >
        <Icon
          source="shoe-print"
          size={23}
          color={C.botonTexto}
        />

        <Text style={s.accesoTexto}>
          Camina y gana
        </Text>
      </Pressable>

      <Portal>
        <Modal
          visible={m.invitacion}
          onDismiss={m.cerrarInvitacion}
          contentContainerStyle={s.modal}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar invitación"
            onPress={m.cerrarInvitacion}
            style={s.cerrar}
          >
            <Icon
              source="close"
              size={24}
              color={C.crema}
            />
          </Pressable>

          <View style={s.medalla}>
            <Icon
              source="trophy-outline"
              size={61}
              color={C.doradoClaro}
            />
          </View>

          <Text style={s.leyenda}>
            UNA NUEVA MISIÓN TE ESPERA
          </Text>

          <Text style={s.titulo}>
            ¡Camina y conquista tus premios!
          </Text>

          <Text style={s.texto}>
            El camino del Sol comienza contigo.
            Recorre 325 metros válidos y consigue
            hasta 325 puntos para canjear dos
            descuentos.
          </Text>

          <View style={s.premios}>
            <Text style={s.premio}>
              10% · 100 puntos
            </Text>

            <Text style={s.premio}>
              25% · 225 puntos
            </Text>
          </View>

          <Button
            mode="contained"
            icon="walk"
            buttonColor={C.boton}
            textColor={C.botonTexto}
            contentStyle={s.boton}
            onPress={irAMision}
          >
            Ver mi misión
          </Button>

          <Button
            textColor={C.textoSecundario}
            onPress={m.cerrarInvitacion}
          >
            Ahora no
          </Button>
        </Modal>
      </Portal>
    </View>
  );
}

const s = StyleSheet.create({
  base: {
    flex: 1,
  },
  acceso: {
    position: "absolute",
    right: 16,
    bottom: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 25,
    backgroundColor: C.boton,
    elevation: 5,
  },
  accesoTexto: {
    color: C.botonTexto,
    fontWeight: "bold",
    fontSize: 12,
  },
  modal: {
    marginHorizontal: 22,
    padding: 23,
    backgroundColor: "#24160B",
    borderWidth: 1,
    borderColor: C.dorado,
    borderRadius: 25,
    gap: 17,
    maxWidth: 500,
    alignSelf: "center",
    width: "88%",
  },
  cerrar: {
    alignSelf: "flex-end",
    padding: 8,
  },
  medalla: {
    alignSelf: "center",
    backgroundColor: "#3C2912",
    padding: 19,
    borderRadius: 50,
  },
  leyenda: {
    color: C.doradoClaro,
    textAlign: "center",
    fontSize: 10,
    letterSpacing: 1.2,
  },
  titulo: {
    color: C.crema,
    fontWeight: "bold",
    fontFamily: "serif",
    fontSize: 27,
    textAlign: "center",
  },
  texto: {
    color: C.textoSecundario,
    fontSize: 14,
    lineHeight: 23,
    textAlign: "center",
  },
  premios: {
    gap: 8,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#3A2712",
  },
  premio: {
    color: C.doradoClaro,
    textAlign: "center",
    fontWeight: "bold",
  },
  boton: {
    minHeight: 50,
  },
});