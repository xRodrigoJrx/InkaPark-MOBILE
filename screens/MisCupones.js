import React, {
  useCallback,
  useState,
} from "react";

import {
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import {
  Button,
  Icon,
  Text,
} from "react-native-paper";

import { useFocusEffect } from
  "@react-navigation/native";

import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../src/config/firebase";

import { useAuth } from
  "../src/context/AuthContext";

import { COLORES as C } from
  "../src/styles/paleta";

export default function MisCupones({
  navigation,
}) {
  const { cuenta } = useAuth();

  const [lista, setLista] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCargando(true);
      setError("");

      return onSnapshot(
        collection(
          db,
          "usuarios",
          cuenta.uid,
          "cupones"
        ),
        (snapshot) => {
          setLista(
            snapshot.docs.map(
              (documento) => ({
                ...documento.data(),
                codigo: documento.id,
              })
            )
          );

          setCargando(false);
        },
        () => {
          setError(
            "No se pudieron cargar los cupones."
          );

          setCargando(false);
        }
      );
    }, [cuenta.uid, intento])
  );

  function volver() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate("MisionCamina");
    }
  }

  return (
    <ScrollView
      contentContainerStyle={s.pagina}
    >
      <Button
        icon="arrow-left"
        textColor={C.doradoClaro}
        onPress={volver}
      >
        Volver
      </Button>

      <Text style={s.titulo}>
        Mis cupones
      </Text>

      <Text style={s.texto}>
        Tus recompensas, listas para acompañar
        tu próxima aventura.
      </Text>

      {cargando && (
        <Text style={s.texto}>
          Consultando cupones…
        </Text>
      )}

      {!!error && (
        <>
          <Text style={s.error}>
            {error}
          </Text>

          <Button
            onPress={() =>
              setIntento(
                (valor) => valor + 1
              )
            }
          >
            Reintentar
          </Button>
        </>
      )}

      {!cargando &&
        !error &&
        !lista.length && (
          <View style={s.panel}>
            <Icon
              source="ticket-percent-outline"
              size={46}
              color={C.dorado}
            />

            <Text style={s.texto}>
              Aún no tienes cupones. Completa
              la misión y canjea una recompensa
              en la tienda.
            </Text>
          </View>
        )}

      {lista.map((cupon) => {
        const usado =
          cupon.estado === "usado";

        const disponible =
          cupon.estado === "disponible";

        return (
          <View
            key={cupon.codigo}
            style={s.panel}
          >
            <View style={s.fila}>
              <Icon
                source={
                  usado
                    ? "ticket-confirmation-outline"
                    : "ticket-percent-outline"
                }
                size={35}
                color={
                  usado
                    ? C.textoSecundario
                    : C.dorado
                }
              />

              <Text style={s.porcentaje}>
                {cupon.porcentaje}%
              </Text>

              <Text
                style={[
                  s.estado,
                  {
                    color: usado
                      ? C.textoSecundario
                      : C.correcto,
                  },
                ]}
              >
                {usado
                  ? "UTILIZADO"
                  : disponible
                  ? "DISPONIBLE"
                  : String(
                      cupon.estado ||
                      "desconocido"
                    ).toUpperCase()}
              </Text>
            </View>

            <Text style={s.texto}>
              Código de tu cuenta.
              Mantén pulsado para seleccionar:
            </Text>

            <Text
              selectable
              style={s.codigo}
            >
              {cupon.codigo}
            </Text>

            <Text style={s.texto}>
              {usado
                ? "Este cupón ya se aplicó a una compra confirmada."
                : "Aplica este código a un solo boleto. Introducirlo en el carrito no lo consume."}
            </Text>

            {disponible && (
              <Button
                mode="outlined"
                icon="cart-outline"
                textColor={C.doradoClaro}
                onPress={() =>
                  navigation
                    .getParent()
                    ?.navigate("Entradas")
                }
              >
                Ir a comprar entradas
              </Button>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  pagina: {
    padding: 18,
    paddingBottom: 40,
    gap: 17,
    backgroundColor: C.fondo,
    flexGrow: 1,
  },
  titulo: {
    color: C.crema,
    fontSize: 29,
    fontFamily: "serif",
    fontWeight: "bold",
  },
  texto: {
    color: C.textoSecundario,
    fontSize: 13,
    lineHeight: 21,
  },
  error: {
    color: C.error,
  },
  panel: {
    backgroundColor: "#25170B",
    borderWidth: 1,
    borderColor: "#735124",
    padding: 18,
    borderRadius: 20,
    gap: 15,
  },
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  porcentaje: {
    color: C.doradoClaro,
    fontSize: 34,
    fontWeight: "bold",
  },
  estado: {
    fontSize: 11,
    fontWeight: "bold",
  },
  codigo: {
    color: C.crema,
    fontSize: 14,
    lineHeight: 23,
    fontFamily: "monospace",
  },
});