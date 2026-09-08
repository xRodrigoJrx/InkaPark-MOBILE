    import React from "react";

    import {
    Dimensions,
    Image,
    ImageBackground,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    } from "react-native";

    import {
    Ionicons,
    } from "@expo/vector-icons";

    import {
    COLORES,
    FUENTES,
    } from "../styles/paleta";

    const { width } = Dimensions.get("window");

    export default function Inicio({ usuario }) {

    return (
        <SafeAreaView style={styles.contenedor}>

        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
        >

{/* HEADER */}

<View style={styles.header}>

<View style={styles.headerIzquierda}>

    <Image
    source={require("../assets/logo.png")}
    style={styles.logo}
    resizeMode="contain"
    />

    <View style={styles.headerNombres}>

    <Text style={styles.headerTitulo}>
        INKAPARK
    </Text>

    <Text style={styles.headerSubtitulo}>
        AVENTURA, CULTURA Y NATURALEZA
    </Text>

    </View>

</View>

<TouchableOpacity
    style={styles.iconoUsuario}
>
    <Ionicons
    name="person-circle-outline"
    size={28}
    color={COLORES.dorado}
    />

    <Text style={styles.nombreUsuario}>
    {(usuario?.nombre || "AVENTURERO").toUpperCase()}
    </Text>
</TouchableOpacity>

</View>


{/* HERO */}

<ImageBackground
source={require("../assets/inicio.png")}
style={styles.hero}
imageStyle={styles.heroImagen}
>

<View style={styles.heroContenido}>

    <Text style={styles.heroTitulo}>
    DESCUBRE TU AVENTURA
    </Text>

    <Text style={styles.heroTexto}>
    Vive la magia de una civilización milenaria
    en un parque temático único.
    </Text>

    <TouchableOpacity
    style={styles.botonHero}
    >
    <Text style={styles.textoBotonHero}>
        VER TUS ENTRADAS →
    </Text>
    </TouchableOpacity>

</View>

</ImageBackground>


{/* PASARELA ESTÁTICA */}

<Text style={styles.tituloExperiencias}>
EXPERIENCIAS
</Text>

<View style={styles.accesos}>

<TouchableOpacity
    style={styles.acceso}
>

    <Ionicons
    name="trail-sign-outline"
    size={30}
    color={COLORES.dorado}
    />

    <Text style={styles.textoAcceso}>
    ATRACCIONES EMOCIONANTES
    </Text>

</TouchableOpacity>


<TouchableOpacity
    style={styles.acceso}
>

    <Ionicons
    name="musical-notes-outline"
    size={30}
    color={COLORES.dorado}
    />

    <Text style={styles.textoAcceso}>
    ESPECTÁCULOS CULTURALES
    </Text>

</TouchableOpacity>


<TouchableOpacity
    style={styles.acceso}
>

    <Ionicons
    name="restaurant-outline"
    size={30}
    color={COLORES.dorado}
    />

    <Text style={styles.textoAcceso}>
    GASTRONOMÍA TÍPICA
    </Text>

</TouchableOpacity>

</View>


            {/* ATRACCIONES */}

            <View style={styles.tituloFila}>

            <Text style={styles.seccionTitulo}>
                ATRACCIONES DESTACADAS
            </Text>

            <TouchableOpacity>
                <Text style={styles.verMas}>
                VER MÁS
                </Text>
            </TouchableOpacity>

            </View>


            <View
            style={styles.listaAtracciones}
            >

            <TouchableOpacity
                style={styles.tarjetaAtraccion}
            >

                <Image
                source={require("../assets/inicio.png")}
                style={styles.imagenAtraccion}
                />

                <View style={styles.infoAtraccion}>

                <Text style={styles.nombreAtraccion}>
                    MONTAÑA INCA
                </Text>

                <Text style={styles.descripcionAtraccion}>
                    Aventura y naturaleza
                </Text>

                </View>

            </TouchableOpacity>


            <TouchableOpacity
                style={styles.tarjetaAtraccion}
            >

                <Image
                source={require("../assets/inicio.png")}
                style={styles.imagenAtraccion}
                />

                <View style={styles.infoAtraccion}>

                <Text style={styles.nombreAtraccion}>
                    SHOW CULTURAL
                </Text>

                <Text style={styles.descripcionAtraccion}>
                    Cultura y tradición
                </Text>

                </View>

            </TouchableOpacity>


            <TouchableOpacity
                style={styles.tarjetaAtraccion}
            >

                <Image
                source={require("../assets/inicio.png")}
                style={styles.imagenAtraccion}
                />

                <View style={styles.infoAtraccion}>

                <Text style={styles.nombreAtraccion}>
                    RÍO SAGRADO
                </Text>

                <Text style={styles.descripcionAtraccion}>
                    Naturaleza y diversión
                </Text>

                </View>

            </TouchableOpacity>

            </View>


            {/* EXPERIENCIA */}

            <ImageBackground
            source={require("../assets/inicio.png")}
            style={styles.experiencia}
            imageStyle={styles.experienciaImagen}
            >

            <View style={styles.experienciaContenido}>

                <Text style={styles.experienciaTitulo}>
                VIVE LA EXPERIENCIA INKAPARK
                </Text>

                <Text style={styles.experienciaTexto}>
                Descubre un lugar donde la
                aventura se encuentra con
                nuestra cultura.
                </Text>

                <TouchableOpacity
                style={styles.botonExperiencia}
                >
                <Text style={styles.textoBotonExperiencia}>
                    DESCUBRIR
                </Text>
                </TouchableOpacity>

            </View>

            </ImageBackground>


            {/* NAVEGACIÓN */}

            <View style={styles.navegacion}>

            <TouchableOpacity
                style={styles.navItem}
            >

                <Ionicons
                name="home"
                size={24}
                color={COLORES.dorado}
                />

                <Text style={styles.navTextoActivo}>
                INICIO
                </Text>

            </TouchableOpacity>


            <TouchableOpacity
                style={styles.navItem}
            >

                <Ionicons
                name="compass-outline"
                size={24}
                color={COLORES.textoSecundario}
                />

                <Text style={styles.navTexto}>
                EXPLORAR
                </Text>

            </TouchableOpacity>


            <TouchableOpacity
                style={styles.navItem}
            >

                <Ionicons
                name="ticket-outline"
                size={24}
                color={COLORES.textoSecundario}
                />

                <Text style={styles.navTexto}>
                ENTRADAS
                </Text>

            </TouchableOpacity>


            <TouchableOpacity
                style={styles.navItem}
            >

                <Ionicons
                name="person-outline"
                size={24}
                color={COLORES.textoSecundario}
                />

                <Text style={styles.navTexto}>
                PERFIL
                </Text>

            </TouchableOpacity>

            </View>

        </ScrollView>

        </SafeAreaView>
    );
    }


    const styles = StyleSheet.create({

    contenedor: {
        flex: 1,
        backgroundColor: COLORES.fondo,
    },

    scroll: {
        paddingBottom: 25,
    },


    /* HEADER */

    header: {
        width: "100%",
        paddingHorizontal: 20,
        paddingVertical: 12,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",

        borderBottomWidth: 1,
        borderBottomColor: COLORES.bordeTarjeta,
    },

headerIzquierda: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
},

logo: {
    width: 58,
    height: 40,
    marginRight: 8,
},

headerNombres: {
    flex: 1,
    justifyContent: "center",
},

headerTitulo: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 15,
    fontWeight: "bold",
    letterSpacing: 1.5,
},

headerSubtitulo: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 6,
    letterSpacing: 0.8,
    marginTop: 2,
},

iconoUsuario: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    maxWidth: 95,
},

nombreUsuario: {
    color: COLORES.dorado,
    fontFamily: FUENTES.principal,
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
    marginTop: 2,
},


/* HERO */

hero: {
    width: width - 40,
    height: 260,
    marginTop: 22,
    marginHorizontal: 20,

    justifyContent: "flex-end",

    overflow: "hidden",
    borderRadius: 18,
},

    heroImagen: {
        borderRadius: 18,
    },

    heroContenido: {
        padding: 18,
        backgroundColor: "rgba(0,0,0,0.35)",
    },

heroTitulo: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 25,
    fontWeight: "bold",
    letterSpacing: 2,
},

heroTexto: {
    color: COLORES.doradoClaro,
    fontFamily: FUENTES.principal,
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
    maxWidth: 270,
},

botonHero: {
    width: 145,
    height: 38,
    marginTop: 14,

    backgroundColor: COLORES.boton,

    borderWidth: 1,
    borderColor: COLORES.botonBorde,
    borderRadius: 8,

    justifyContent: "center",
    alignItems: "center",
},

    textoBotonHero: {
        color: COLORES.botonTexto,
        fontFamily: FUENTES.principal,
        fontSize: 8,
        fontWeight: "bold",
        letterSpacing: 1,
    },


    /* SECCIONES */

    seccionTitulo: {
        color: COLORES.crema,
        fontFamily: FUENTES.principal,
        fontSize: 13,
        fontWeight: "bold",
        letterSpacing: 1,
    },

tituloExperiencias: {
    marginHorizontal: 20,
    marginTop: 25,
},

    tituloFila: {
        marginHorizontal: 20,
        marginTop: 25,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    verMas: {
        color: COLORES.dorado,
        fontFamily: FUENTES.principal,
        fontSize: 8,
        fontWeight: "bold",
    },


    /* ACCESOS */

    accesos: {
        marginHorizontal: 20,
        marginTop: 13,

        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

acceso: {
    flex: 1,

    minHeight: 115,

    marginHorizontal: 4,

    paddingHorizontal: 4,

    backgroundColor: COLORES.tarjeta,

    borderWidth: 1,
    borderColor: COLORES.bordeTarjeta,
    borderRadius: 12,

    justifyContent: "center",
    alignItems: "center",
},

textoAcceso: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.5,
},


    /* ATRACCIONES */

listaAtracciones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "stretch",

    marginHorizontal: 20,
    marginTop: 13,
},

tarjetaAtraccion: {
    flex: 1,

    marginHorizontal: 4,

    backgroundColor: COLORES.tarjeta,

    borderWidth: 1,
    borderColor: COLORES.bordeTarjeta,

    borderRadius: 14,

    overflow: "hidden",
},

imagenAtraccion: {
    width: "100%",
    height: 100,
},

infoAtraccion: {
    padding: 13,
},

nombreAtraccion: {
    color: COLORES.crema,
    fontFamily: FUENTES.principal,
    fontSize: 11.5,
    fontWeight: "bold",
},

descripcionAtraccion: {
    color: COLORES.textoSecundario,
    fontFamily: FUENTES.principal,
    fontSize: 8,
    marginTop: 4,
},


    /* EXPERIENCIA */

    experiencia: {
        width: width - 40,
        height: 170,

        marginHorizontal: 20,
        marginTop: 25,

        borderRadius: 18,
        overflow: "hidden",

        justifyContent: "center",
    },

    experienciaImagen: {
        borderRadius: 18,
    },

    experienciaContenido: {
        padding: 20,
        backgroundColor: "rgba(0,0,0,0.42)",
        flex: 1,
        justifyContent: "center",
    },

    experienciaTitulo: {
        color: COLORES.crema,
        fontFamily: FUENTES.principal,
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
    },

    experienciaTexto: {
        color: COLORES.textoSecundario,
        fontFamily: FUENTES.principal,
        fontSize: 8,
        lineHeight: 15,
        marginTop: 7,
        maxWidth: 270,
    },

    botonExperiencia: {
        width: 105,
        height: 34,

        marginTop: 12,

        backgroundColor: COLORES.boton,

        borderWidth: 1,
        borderColor: COLORES.botonBorde,
        borderRadius: 8,

        justifyContent: "center",
        alignItems: "center",
    },

    textoBotonExperiencia: {
        color: COLORES.botonTexto,
        fontFamily: FUENTES.principal,
        fontSize: 7.5,
        fontWeight: "bold",
        letterSpacing: 1,
    },


    /* NAVEGACIÓN */

    navegacion: {
        marginTop: 25,

        minHeight: 65,

        paddingHorizontal: 10,

        backgroundColor: COLORES.tarjeta,

        borderTopWidth: 1,
        borderTopColor: COLORES.bordeTarjeta,

        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
    },

    navItem: {
        flex: 1,

        justifyContent: "center",
        alignItems: "center",
    },

    navTextoActivo: {
        color: COLORES.dorado,
        fontFamily: FUENTES.principal,
        fontSize: 6.5,
        fontWeight: "bold",
        marginTop: 3,
    },

    navTexto: {
        color: COLORES.textoSecundario,
        fontFamily: FUENTES.principal,
        fontSize: 6.5,
        marginTop: 3,
    },

    });