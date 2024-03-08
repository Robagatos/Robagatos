/*jshint esversion: 8 */
const VERSION = "1.0.2";

var bufferctx;
var canvas;
var buffer;
var pantallaActual;
var animFrame;
var nivel = 1;
var pantalla = 1;
var puntuacion = 0;
var recordMax = 0;
var recordHoy = 0;
var recordMes = 0;
const bolaGrandeStartX = 275;
const bolaGrandeStartY = 675;
const bolaPeqStartX = 285;
const bolaPeqStartY = 745;
const minTamColision = 5;

const speed = 10;
const imagenes = [];
const imagenesLiterales = ["rosa", "amarillo", "azul", "verde", "naranja", "morado", "rojo", "marron", "blanca", "virus_peq", "fondo", "explosion", "neurona", "reemplazar", "virus2"];

const CARGANDO = "CARGANDO";
const INFECCION = "Infeccion ";
const PUNTOS = "Puntos ";
const GAME = "GAME";
const OVER = "OVER";
const YOU = "YOU";
const WIN = "WIN!";
const REEMPLAZAR = "Cambiar";
const PULSA = "Pulsa para Comenzar";
const VIRUS = "Virus";
const BALL = "Ball!";
const FUGA = "¡Fuga!";

var todoCargado = false;
var debug = false;
var fpsArray = [];
var timeConts = 0;
var timeEnds;

// FUNCIONES

function cargarImagenes(index) {
    let nombreFichero = imagenesLiterales[index];
    let imagen = new Image();
    imagen.src = `./imagenes/virusball/${nombreFichero}.png`;
    imagen.onload = function() {
        imagenes[nombreFichero] = imagen;
        pantallaActual.elementoTexto = nombreFichero;
        if (index < imagenesLiterales.length - 1)
            setTimeout(() => { cargarImagenes(index + 1); }, 10);
        else {
            crearImagenes("virus_peq");
            // crearImagenes("virus2");
            let promise = new Promise((resolve, reject) => {
                crearVirusGordos();
                resolve();
            });
            let then = setTimeout(() => {
                crearImagenes("virusgordo");
                todoCargado = true;
            }, 1000);
            promise.then(then);
        }
    };
}

// Función para voltear la imagen
function voltearImagen(original) {
    const filas = original.length;
    const columnas = original[0].length;

    // Crear una nueva matriz para la imagen volteada
    const volteada = new Array(filas);
    for (let i = 0; i < filas; i++) {
        volteada[i] = new Array(columnas);
    }

    // Voltear la imagen
    for (let i = 0; i < filas; i++) {
        for (let j = 0; j < columnas; j++) {
            volteada[i][j] = original[filas - 1 - i][j];
        }
    }

    return volteada;
}

WebFont.load({
    google: {
        families: ['Fuzzy Bubbles:300,400,700']
    },
    loading: function() {
        // pantallaActual.elementoTexto="Fonts are being loaded");
    },
    active: function() {
        // pantallaActual.elementoTexto="Fonts have been rendered");
    }
});

// ////////////////////
function crearImagenes(fileImage) {
    const imgOriginal = imagenes[fileImage];
    const imgVolteada = new Image();

    // Crear un elemento canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Establecer las dimensiones del canvas para que coincidan con la imagen original
    canvas.width = imgOriginal.width;
    canvas.height = imgOriginal.height;

    // Dibujar la imagen original en el canvas
    ctx.drawImage(imgOriginal, 0, 0);

    // Obtener los datos de píxeles de la imagen original
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Crear un nuevo elemento canvas para la imagen volteada
    const canvasVolteada = document.createElement('canvas');
    const ctxVolteada = canvasVolteada.getContext('2d');

    // Establecer las dimensiones del canvas volteado
    canvasVolteada.width = canvas.width;
    canvasVolteada.height = canvas.height;

    // Voltear la imagen horizontalmente
    ctxVolteada.translate(canvas.width, 0);
    ctxVolteada.scale(-1, 1);

    // Dibujar la imagen original volteada en el canvas volteado
    ctxVolteada.drawImage(canvas, 0, 0);

    // Asignar la imagen volteada al objeto Image
    imgVolteada.src = canvasVolteada.toDataURL();

    imagenes[fileImage + "_flip"] = imgVolteada;



}

const coloresArray = [
    [255, 0, 0], //
    [0, 176, 255],
    [255, 255, 0],
    [0, 255, 0],
    [180, 0, 255],
    [255, 102, 0]

];


function crearVirusGordos() {

    let arrayImagenes = [];

    //obtenermos el data del color rojo y el color rojo
    let baseRojo;
    let baseAzul;
    let baseAmarillo;
    let baseNaranja;
    let baseVerde;
    let baseMorado;
    let baseRosa = new Image();

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(imagenes["virus2"],
        200,
        0,
        100,
        100,
        0, //x
        0, //y
        100, // ancho
        100);
    baseRosa.src = canvas.toDataURL();
    baseRosa.onload = () => {
        pantallaActual.elementoTexto = "base rosa cargado";
        baseRojo = colorear(baseRosa, 0);
        baseRojo.onload = () => {
            pantallaActual.elementoTexto = "base baseRojo cargado";
            baseAmarillo = colorear(baseRosa, 1);
            baseAmarillo.onload = () => {
                pantallaActual.elementoTexto = "base baseAmarillo cargado";
                baseAzul = colorear(baseRosa, 2);
                baseAzul.onload = () => {
                    pantallaActual.elementoTexto = "baseAzul cargado";
                    baseNaranja = colorear(baseRosa, 5);
                    baseNaranja.onload = () => {
                        pantallaActual.elementoTexto = "baseNaranja cargado";
                        baseVerde = colorear(baseRosa, 3);
                        baseVerde.onload = () => {
                            pantallaActual.elementoTexto = "baseVerde cargado";
                            baseMorado = colorear(baseRosa, 4);
                            baseMorado.onload = () => {
                                pantallaActual.elementoTexto = "baseMorado cargado";
                                pantallaActual.elementoTexto = "cargarImagenesVirus ";
                                let imgR = construirImagenBase(baseRosa);
                                imgR.onload = () => {
                                    arrayImagenes.push(imgR);
                                    let imgAzul = construirImagenBase(baseAzul);
                                    imgAzul.onload = () => {
                                        arrayImagenes.push(imgAzul);
                                        let imgAma = construirImagenBase(baseAmarillo);
                                        imgAma.onload = () => {
                                            arrayImagenes.push(imgAma);
                                            let imgVerde = construirImagenBase(baseVerde);
                                            imgVerde.onload = () => {
                                                arrayImagenes.push(imgVerde);
                                                let imgNaranja = construirImagenBase(baseNaranja);
                                                imgNaranja.onload = () => {
                                                    arrayImagenes.push(imgNaranja);
                                                    let imgMorado = construirImagenBase(baseMorado);
                                                    imgMorado.onload = () => {
                                                        arrayImagenes.push(imgMorado);
                                                        let imgRojo = construirImagenBase(baseRojo);
                                                        imgRojo.onload = () => {
                                                            arrayImagenes.push(imgRojo);
                                                            pantallaActual.elementoTexto = "imagenes cargadas";
                                                            // let imgOriginal = imagenes["virus2"];
                                                            let img2 = new Image();
                                                            let canvas = document.createElement('canvas');
                                                            let ctx = canvas.getContext('2d');
                                                            canvas.width = 700;
                                                            canvas.height = 200;
                                                            // console.table(arrayImagenes);
                                                            for (let i = 0; i < arrayImagenes.length; i++) {
                                                                // mov 1
                                                                ctx.drawImage(arrayImagenes[i],
                                                                    100 * i,
                                                                    0);
                                                            }
                                                            img2.src = canvas.toDataURL();
                                                            img2.onload = () => {
                                                                imagenes["virusgordo"] = img2;
                                                            };
                                                        };
                                                    };
                                                };
                                            };
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
}

function colorear(img, color) {

    let img2 = new Image();

    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        data[i] = coloresArray[color][0]; // red
        data[i + 1] = coloresArray[color][1]; // green
        data[i + 2] = coloresArray[color][2]; // blue
    }
    ctx.putImageData(imageData, 0, 0);
    img2.src = canvas.toDataURL();

    return img2;
};


function cargarImagenesVirus() {
    pantallaActual.elementoTexto = "cargarImagenesVirus ";
    let imgR = construirImagenBase();
    imgR.onload = () => {
        imagenes.test = imgR;
    }
}

function construirImagenBase(colorBase) {

    let imgOriginal = imagenes["virus2"];
    let img2 = new Image();
    // Crear un elemento canvas
    let canvas = document.createElement('canvas');
    let ctx = canvas.getContext('2d');
    canvas.width = 100;
    canvas.height = 200;


    ctx.drawImage(colorBase, 0, 0);

    ctx.drawImage(imgOriginal,
        0,
        0,
        100,
        100,
        0, //x
        0, //y
        100, // ancho
        100); //ALTO
    // mov 2
    ctx.drawImage(colorBase,
        0,
        0,
        100,
        100,
        0, //x
        100, //y
        100, // ancho
        100); //ALTO
    ctx.drawImage(imgOriginal,
        100,
        0,
        100,
        100,
        0, //x
        100, //y
        100, // ancho
        100); //ALTO

    img2.src = canvas.toDataURL();

    return img2;


}