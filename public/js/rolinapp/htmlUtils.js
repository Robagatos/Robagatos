/*jshint esversion: 6 */
const UN_SEGUNDO = 1000;
const CINCO_SEGUNDOS = 5000;
const LOG_ARRAY_INFO = [];
//generico de carga de json

function cargarJson(urlJson, funcionPopulate) {
    let requestURL = '../js/rolinapp/' + urlJson;
    let request = new XMLHttpRequest();
    request.open('GET', requestURL, true);

    request.responseType = "json";
    request.send();

    request.onload = function() {
        let datos = request.response;
        funcionPopulate(datos);
    };
}

//redirigir html
function redirigirPagina(urlDirigir) {
    setTimeout(function() { window.location.href = "/rolinapp/" + urlDirigir; }, 200);
}

function llamadaServer(url, mensaje) {
    let protocol = window.location.protocol;
    let host = window.location.host;
    let requestURL = protocol + '//' + host + '/rolinapp/p?reqCode=' + url;
    // // console.log(requestURL);
    let request = new XMLHttpRequest();
    if (mensaje != undefined || mensaje != null) {
        // // console.log("solicitar POST con mensaje: ");
        // // console.log(mensaje);
        request.open("POST", requestURL);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(mensaje));
    } else {
        // // console.log("solicitar GET");
        request.open('GET', requestURL, true);
        request.responseType = "json";
        request.send();
    }



    return request;
}

// *** CONSULTA ***

/** metodo para realizar una consulta al servidor. Para ejecutarla en bucle llamar a ejecutarConsultaEnBucle */

function consultar(url, funcionResolver, notOK) { //hay que arreglar la parte del mensaje a enviar y la funcionResolver a ejecutar en el then

    console.log("1- consultar " + url);
    let promise = new Promise((resolve, reject) => {
        let request = llamadaServer(url);
        request.onload = function() {
            let respuesta = request.response;
            console.log("2- consultar: respuesta " + respuesta.code);
            if (respuesta.code == 'OK') {
                resolve(respuesta);
            } else {
                notOK(respuesta);
            }
        };
    });
    promise.then(funcionResolver);
}

function ejecutarConsultaEnBucle(retryTime) {

    setTimeout(function() { consultar(); }, retryTime);
}


//** FIN CONSULTA */

/** SOLICITUD */

function solicitar(url, funcionResolver, notOK, mensaje) { //hay que arreglar la parte del mensaje a enviar y la funcionResolver a ejecutar en el then
    //este no es el lugar para esto.... lo pasaré a partidaFW o a motorReglasCore

    if (tipoJugador == "master") {
        salvarPartida();
    }
    // console.log("1- solicitar");
    let promise = new Promise((resolve, reject) => {
        let request = llamadaServer(url, mensaje);
        request.onload = function() {
            // // console.log(request.response);
            let respuesta = JSON.parse(request.response);
            // console.log("2- solicitar: respuesta " + respuesta.code);
            if (respuesta.code == 'OK') {
                resolve(respuesta);
            } else {
                notOK();
            }
        };
    });
    promise.then(funcionResolver);
}

/** FIN SOLICITUD */

function enviarComentario() {

    let mensaje = {
        mail: document.getElementById('mail').value,
        comentario: document.getElementById('comentario').value
    };
    console.log(mensaje);
    if (mensaje.comentario == "") {
        alert("El comentario no puede estar vacio.");
    } else {
        document.getElementById('comentarios').style = "display: none;";
        let promise = new Promise((resolve, reject) => {
            let request = llamadaServer("comments", mensaje);
            request.onload = function() {
                let respuesta = JSON.parse(request.response);
                console.log("2- consultar: respuesta " + respuesta.code);
                if (respuesta.code == 'OK') {
                    resolve(respuesta);
                } else {
                    reject();
                }
            };
        });
        promise.then((respuesta) => {
            document.getElementById('comentarioEnviado').style = "display: block;";
        });
        promise.catch(() => {
            alert("Error en el envio del comentario");
        });

    }
}

//esta funcion busca capacidades especiales o equipo (realmente busca sobre el array que se le pase) si hay alguno del palo indicado y lo aplica al element pasado

function addHtmlElementDeColeccionFiltrandoPorPalo(coleccion, matchElement, rootElement) {

    let match = [];
    coleccion.forEach(ce => {
        if (ce.palo == matchElement && !ce.tipo.includes("GPJ"))
            match.push(ce);
    });

    let root = document.getElementById(rootElement);
    root.innerHTML = "";

    match.forEach((element) => {
        let html = `<div class="col"><input type="checkbox" id="${element.id}">${element.nombre}</div>`;
        let row = document.createElement('row');
        row.innerHTML = html;
        root.insertAdjacentElement("beforeend", row);
    });

    return match.length > 0 ? true : false;
}

function addHtmlElementDeColeccionFiltrandoPorID(coleccion, matchElement, rootElement) {

    let match = [];
    coleccion.forEach(ce => {
        if (ce == matchElement)
            match.push(ce);
    });

    let buscarElemento = (col, element) => {
        col.forEach(mov => {
            if (mov.id == element) {
                let html = `<input type="checkbox" id="${mov.id}" checked >${mov.nombre}`;
                let row = document.createElement('row');
                row.innerHTML = html;
                rootElement.insertAdjacentElement("beforeend", row);
            }
        });
    };
    match.forEach((element) => {
        buscarElemento(movimientos, element);
        buscarElemento(equipo, element);
    });

    return match.length > 0 ? true : false;
}

//esta funcion añade un html a un root element creando listado dinamico

function addHtmlElement(element, rootElement) {
    let row = document.createElement('div');
    row.innerHTML = element;
    rootElement.insertAdjacentElement("beforeend", row);
}

function getSelectValue(root) {
    for (let item of root) {
        if (item.selected) {
            return item.value;
        }
    }
}
/**
 * metodo para informar al usuario en caja infoTop
 * @param {string} informacion informacion a mostrar en html
 */
function informar(informacion) {
    document.getElementById("infoTop").innerHTML = informacion;
}

function writeFile(filename, content) {
    console.log("writeFile " + filename);
    console.log(typeof content);
    // let type = "application/octet-stream";
    if (typeof content == "object") {
        content = JSON.stringify(content);

    }

    // let encoder = new TextEncoder();
    //content = encoder.encode(content);
    // content = jsonToByteArray(content);
    let el = (sel, par) => (par || document).querySelector(sel);
    let elNew = (tag, prop) => Object.assign(document.createElement(tag), prop);

    // Create file and download it:

    const createAndDownload = (content, download = "download.txt", type = "text/plain") => {
        console.log(content);
        console.log(type);
        const file = new Blob([content], { type });
        const href = URL.createObjectURL(file);
        const elAnchor = elNew("a", { href, download });
        el("body").append(elAnchor);
        elAnchor.click();
        elAnchor.remove();
        URL.revokeObjectURL(href);
    };
    createAndDownload(content, filename, null);
}

function loadFile(fn) {
    console.log("loadFile ");
    let inputArchivo = document.getElementById('importarArchivo');
    let file = inputArchivo.files[0];
    let nombreArchivo = inputArchivo.files[0].name;
    // let labelArchivo = document.getElementById('labelarchivo');
    if (nombreArchivo.value != "") {
        // labelArchivo.innerHTML = nombreArchivo.substring(0, nombreArchivo.lastIndexOf("."));
        let reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        return reader;


    }
}