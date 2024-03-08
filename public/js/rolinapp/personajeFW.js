/*jshint esversion: 6 */
let personajes;
let movimientos;
let equipo;
let estados_salud;
let literales_heridas;
// let contadorPJs = 0;
let descripcion_habilidades;
let descripcion_dificultad;
let consecuencias;
let parciales = {};
let contadorConsecuenciasEmpleadas = [];

function puntuarHab(nivelHab, imgFile, rootElement) {
    rootElement.innerHTML = "";
    for (let i = 0; i < nivelHab; i++) {
        let row = document.createElement('img');
        row.src = "../imagenes/rolinapp/" + imgFile + ".png";
        row.style.height = "20px";
        row.style.width = "20px";

        rootElement.insertAdjacentElement("beforeend", row);
    }
}

function fichaHTML(valor) {
    let htmlBase = `<div class="card-header" id="heading${valor}">
    <h5 class="mb-0">
        <button id="personaje_${valor}" class="btn btn-link" data-toggle="collapse" data-target="#collapse${valor}" aria-expanded="true" aria-controls="collapse${valor}">Personaje ${valor}</button> </h5>
</div>
</div>
<div id="collapse${valor}" class="collapse" aria-labelledby="heading${valor}" data-parent="#accordion">
<div id="descripcionPJ_${valor}" style="display: none;">
<div class="row justify-content-center">   
    <img id="logoJuego_${valor}" class = "w-50" src="../imagenes/rolinapp/logo(logoJuego))horizontal.png">
</div>
        <h5 class="card-header">Concepto</h5>
        <div class="card-body text-left">
        <div class="container"> 
            
            <div class="row">  
                <div class="col">  
                    <div class="rounded float-right" id="exp_${valor}"> 

                    </div>
                    <div id ="fotoPj_${valor}"></div> 
                    <div><b>Clase: </b> <span class="text-capitalize" id="clase_${valor}" /></div>
                    <div id="desc_${valor}"></div> 
                </div>
            </div>
        </div>
        </div>
        <h5 class="card-header">Habilidades</h5>
        <div class="card-body text-left">
        <div><i id ="especial_${valor}"></i></div>
        <table class="table">
            <tbody>
                <tr>
                    <td><span id="picas_${valor}" onclick="informar('<b>Picas</b> esta relacionada con la violencia.')"></span></td>
                    <td><span id="corazones_${valor}" onclick="informar('<b> Corazones</b> esta relacionada con las relaciones humanas, la empatia, arengar y convencer.')"></span></td>
                    <td><span id="treboles_${valor}" onclick="informar('<b> Treboles </b>esta relacionada con las habilidades de campo abierto como trepar, nadar, montar, saltar, acrobacias y percepcion.')"></span></td>
                    <td><span id="diamantes_${valor}" onclick="informar('<b> Diamantes</b> se relaciona con el subterfugio, mentir, juegos de manos.')"></span></td>

                </tr>
            </tbody>
        </table>
    </div>
 
        <h5 class="card-header">Capacidades Especiales</h5>
        <div class="card-body text-left">
            <div class="col"> <span id="ce_${valor}" /> </div>
        </div>
        <h5 class="card-header">Equipo</h5>
        <div class="card-body text-left">
            <div class="col"> <span id="equipo_${valor}" />
            </div>
        </div>
        <h5 class="card-header">Gestion</h5>
        <div class="card-body ">
<button type="button" class="btn  rounded-pill btn-danger " data-toggle="modal" data-target="#exampleModalCenter${valor}"> Borrar Personaje </button>
<div class="modal fade" id="exampleModalCenter${valor}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
            <div class="modal-body"> ¿Seguro que quieres borrar el personaje? </div>
            <div class="modal-footer">
                <button type="button" id="id_pj_${valor}" class="btn btn-danger" data-dismiss="modal" onclick="borrarPersonaje(this)">Borrar</button>
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
    <button type="button" class="btn rounded-pill " onclick="exportarPj(${valor})"> Exportar Personaje </button>
    </div>
</div>

</div>
</div>`;
    let root = document.getElementById('accordion');
    let div = document.createElement('div');
    div.className = "card";
    div.innerHTML = htmlBase;
    // div.style.display = "none";
    div.id = "fichaPJ_" + valor;
    root.insertAdjacentElement("beforeend", div);
}

function selectoresPjsHTML(personajeId, personajeNombre, rootElement) {

    let htmlBase = `<input class="form-check-input" type="radio" name="pnjCheckControl" value="${personajeId}""> 
    <span name="pjNombre_${personajeId}" >${personajeNombre}</span>`;

    let root = document.getElementsByName(rootElement);
    for (let i = 0; i < root.length; i++) {
        let element = root[i];
        let div = document.createElement('div');
        div.innerHTML = htmlBase;
        element.insertAdjacentElement("beforeend", div);
    }
}

function selectoresPnjsHTML(personajeId, personajeNombre, rootElement) {

    let htmlBase = `<input class="form-check-input" type="radio" value="${personajeId}" name="pnjCheckControl" onclick="updateVisor('${personajeId}')"> 
    <span name="pjNombre_${personajeId}" >${personajeNombre}</span>`;

    let root = document.getElementsByName(rootElement);
    for (let i = 0; i < root.length; i++) {
        let element = root[i];
        let div = document.createElement('div');
        div.innerHTML = htmlBase;
        element.insertAdjacentElement("beforeend", div);
    }
}
// la idea es que todos los datos descriptivos y demas de los personajes esten en un json.
function cargarDescripcionesPersonajes(fn) {

    if (fn == null) {

        fn = (jsonObj) => {

            personajes = jsonObj.personajes;
            movimientos = jsonObj.movimientos;
            equipo = jsonObj.equipo;
            estados_salud = jsonObj.estados_salud;
            literales_heridas = jsonObj.literales_heridas;
            descripcion_habilidades = jsonObj.descripcion_habilidades;
            descripcion_dificultad = jsonObj.descripcion_dificultad;
            consecuencias = jsonObj.consecuencias;

            Object.keys(consecuencias).map(consecuenciaKey => {
                contadorConsecuenciasEmpleadas[consecuenciaKey] = 0;
                if (consecuencias[consecuenciaKey].tipo.includes("negativo")) {
                    parciales[consecuenciaKey] = consecuencias[consecuenciaKey];
                }
            });

        };
    }
    cargarJson('descripcionesPersonajes.json', fn);
}

function insertaPJenHtml(personaje, idRoot) { //, contador) {
    // console.log("insertaPJenHtml");
    let root = document.getElementById(idRoot);
    // let valor = contador;
    let div = document.createElement('div');
    let htmlBase;
    // ficha en pagina del jugador en partida. si que llegan los pxs!
    if (idRoot == "jugador") {
        htmlBase = `<div class="card-header bg-primary text-light" id="pj_${personaje.id}">Personaje</div>
        <div class="card-body">
        <div id="descripcionPJ_${personaje.id}">
            <div class="row">
                    <div id="fotoPj_${personaje.id}"></div>
                    <div class="col">
                        <div class="row p-1"><b>Clase: </b><span id="clase_${personaje.id}" /></div>
                        <div class="row p-1" id="desc_${personaje.id}"> </div>
                        </p>
                        <div class="row p-1"><b>Salud: </b> <span id="salud_${personaje.id}"></span> </div>
                        <div class="row p-1"><b>Condiciones: </b> </div>
                        <div class="row">
                            <div class="col" id="condiciones_${personaje.id}"></div> 
                        </div>
                    </div>
            </div>
            <div class="row">                
                        <div class="col" id="exp_${personaje.id}"> </div>
                    </div>
        </div>
            </p>
                <div class="card-header bg-primary text-light">Habilidades</div>
                <div class="card-body text-left">
                <div><i><b>${personaje.nombre}</b> resuelve los checkeos de <b>${personaje.habEspecial}</b> con <b>${personaje.palo}</b></i></div>
                <table class="table">

                    <tbody>
                        <tr>
                            <td><span id="picas_${personaje.id}" onclick="informar('<b>Picas</b> esta relacionada con la violencia.')"></span></td>
                            <td><span id="corazones_${personaje.id}" onclick="informar('<b> Corazones</b> esta relacionada con las relaciones humanas, la empatia, arengar y convencer.')"></span></td>
                            <td><span id="treboles_${personaje.id}" onclick="informar('<b> Treboles </b>esta relacionada con las habilidades de campo abierto como trepar, nadar, montar, saltar, acrobacias y percepcion.')"></span></td>
                            <td><span id="diamantes_${personaje.id}" onclick="informar('<b> Diamantes</b> se relaciona con el subterfugio, mentir, juegos de manos.')"></span></td>
                        </tr>
                    </tbody>
                </table>
                   </div>
                <div class="card-header bg-primary text-light">Capacidades Especiales</div>
                <div class="card-body text-left">
                    <div class="col"> <span id="ce_${personaje.id}" /> </div>
                </div>
                <div class="card-header bg-primary text-light">Equipo</div>
                <div class="card-body text-left">
                    <div class="col"> <span id="equipo_${personaje.id}" /> </div>
                </div>
            </div>
        </div>`;
    } else {
        // esto es la ventanita ficha jugador en partidaDirector--aqui falta el boton expulsar y el dar px la clase de pj y la foto.
        htmlBase = `<div class="card-header" id="heading${personaje.id}">
        <h5 class="mb-0">
            <button id="pj_${personaje.id}" class="btn btn-link " data-toggle="collapse" data-target="#collapse${personaje.id}" aria-expanded="true" aria-controls="collapse${personaje.id}">Hueco Vacio</button> </h5>
    </div>
    <div id="collapse${personaje.id}" class="collapse" aria-labelledby="heading${personaje.id}" data-parent="#accordion">
        <div id="descripcionPJ_${personaje.id}" class="card-body" style="display: none;">
            <div class="row">
                <div class="col"> 
                <div class="rounded float-right" id="exp_${personaje.id}"> 
                        <img src="../imagenes/rolinapp/estrellaSheriff.png" style="width: 30px; height:auto;" />
                        <img src="../imagenes/rolinapp/estrellaSheriff_negra.png" style="width: 30px; height:auto;" />
                    </div>
                    <div id="fotoPj_${personaje.id}"></div>
                    <div class="col text-left"> 
                        <div>Clase: <span id="clase_${personaje.id}" /> </div>
                        <div>Salud: <span id="salud_${personaje.id}" /> </div>
                        <div> <span id="desc_${personaje.id}" /> </div>
                    </div>
                </div>
            </div>
            <div class="row">
            <div><i><b>${personaje.nombre}</b> resuelve los checkeos de <b>${personaje.habEspecial}</b> con <b>${personaje.palo}</b></i></div>
            </div>
            <div class="row">
                <div class="col"> <b>Habilidades</b>
                <table class="table">
               
                    <tbody>
                        <tr>
                            <td><span id="picas_${personaje.id}" onclick="informar('<b>Picas</b> esta relacionada con la violencia.')"></span></td>
                            <td><span id="corazones_${personaje.id}" onclick="informar('<b> Corazones</b> esta relacionada con las relaciones humanas, la empatia, arengar y convencer.')"></span></td>
                            <td><span id="treboles_${personaje.id}" onclick="informar('<b> Treboles </b>esta relacionada con las habilidades de campo abierto como trepar, nadar, montar, saltar, acrobacias y percepcion.')"></span></td>
                            <td><span id="diamantes_${personaje.id}" onclick="informar('<b> Diamantes</b> se relaciona con el subterfugio, mentir, juegos de manos.')"></span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
                <div class="col"> <b>Capacidades Especiales</b> <span id="ce_${personaje.id}" /> </div>
                <div class="col"> <b>Equipo</b> <span id="equipo_${personaje.id}" /> </div>
            </div>
            <div class="row text-left">
                <div class="col p-1"> <b>Condiciones: </b> <span id="condiciones_${personaje.id}"></span></div>
            </div>
        </div>
    </div>`;
    }
    div.innerHTML = htmlBase;

    root.insertAdjacentElement("beforeend", div);

    rellenaFichaPj(personaje);
}

function rellenaFichaPj(personaje) { //, contador) {
    console.log("rellenaFichaPj: " + personaje.id);
    console.log(personaje);
    // console.log(document.getElementById('especial_' + contador));

    document.getElementById('fotoPj_' + personaje.id).innerHTML = ` <img class="fl-l w-50" src="../imagenes/rolinapp/${personaje.clase}.jpg" style="width: 100%; height:auto;" />`;
    document.getElementById('descripcionPJ_' + personaje.id).style = "block";
    document.getElementById('pj_' + personaje.id).innerText = personaje.nombre;
    document.getElementById('desc_' + personaje.id).innerText = personaje.descripcion;
    document.getElementById('clase_' + personaje.id).innerText = personaje.clase;

    puntuarHab(personaje.habilidades.picas, "picas", document.getElementById('picas_' + personaje.id));
    puntuarHab(personaje.habilidades.treboles, "treboles", document.getElementById('treboles_' + personaje.id));
    puntuarHab(personaje.habilidades.corazones, "corazones", document.getElementById('corazones_' + personaje.id));
    puntuarHab(personaje.habilidades.diamantes, "diamantes", document.getElementById('diamantes_' + personaje.id));

    // obtenemos el div padre donde insertaremos los nuevos
    let rellenarListado = (elementPadre, arrayElementosHijos, descripciones, elementoExtra) => {

        for (const key in arrayElementosHijos) {
            if (Object.hasOwnProperty.call(arrayElementosHijos, key)) {
                let element = arrayElementosHijos[key];
                let div = document.createElement("li");
                if (elementoExtra != null || elementoExtra != undefined) {
                    div.innerHTML = elementoExtra;
                }
                let elemento = descripciones.find(el => el.id == element);
                div.textContent = elemento.nombre;

                let informarDesc = () => {
                    informar(elemento.descripcion);
                };
                div.onclick = informarDesc;
                elementPadre.insertAdjacentElement("beforeend", div);
            }
        }
    };
    rellenarListado(document.getElementById('ce_' + personaje.id), personaje.movimientos, movimientos);
    rellenarListado(document.getElementById('equipo_' + personaje.id), personaje.equipo, equipo);

    let pjID = personaje.id;
    for (const key in personaje.consecuencias) {
        if (Object.hasOwnProperty.call(personaje.consecuencias, key)) {
            let element = personaje.consecuencias[key];
            let consecuenciaNombre = consecuencias[element].nombre;
            let div = document.createElement("li");
            if (pjSeleccionado != null) {
                div.innerHTML = `<span> ${consecuenciaNombre}</span>`;
            } else {
                div.innerHTML = `<button type="button" class="btn btn-danger btn-sm" onclick="quitarCondicion('${element}', '${pjID}')">X</button><span> ${consecuenciaNombre}</span>`;
            }
            let informarDesc = () => {
                informar(consecuencias[element].descripcion);
            };
            div.onclick = informarDesc;
            document.getElementById('condiciones_' + personaje.id).insertAdjacentElement("beforeend", div);
        }
    }
    estadoSaludHtml('salud_' + personaje.id, personaje.salud, personaje.heridas);
    //los px

    personaje.px.forEach(px => {
        // console.log(px);
        let img = document.createElement("span");
        let imgSrc = "../imagenes/rolinapp/estrellaSheriff.png";
        let imgOnClick = `informar('${px.gastado}');`;
        if (px.gastado == "") {
            imgSrc = "../imagenes/rolinapp/estrellaSheriff_negra.png";
            //hay que añadirle el onClick
            imgOnClick = "gastarPx()";
        }

        img.innerHTML = `<img src="${imgSrc}" role = "button" tabIndex = "0" style = "width: 30px; height:auto;  z-index:1;" onclick="${imgOnClick}">`;
        document.getElementById('exp_' + personaje.id).insertAdjacentElement("beforeend", img);
    });

}

function gastarPx() {
    //hay que rellenar los campos del popup

    puntuarHab(pjSeleccionado.habilidades.picas, "picas", document.getElementById('nivelPicas'));
    puntuarHab(pjSeleccionado.habilidades.treboles, "treboles", document.getElementById('nivelTreboles'));
    puntuarHab(pjSeleccionado.habilidades.corazones, "corazones", document.getElementById('nivelCorazones'));
    puntuarHab(pjSeleccionado.habilidades.diamantes, "diamantes", document.getElementById('nivelDiamantes'));
    const disableInputs = (input) => {
        document.getElementById(`${input}PX`).checked = false;
        if (pjSeleccionado.habilidades[input] > 4) {
            document.getElementById(`${input}PX`).disabled = true;
        }
    };
    disableInputs('treboles');
    disableInputs('diamantes');
    disableInputs('corazones');
    disableInputs('picas');

    const crearInputs = (coleccionPorClase, coleccionPj, coleccionDatos, placeHolder) => {
        placeHolder.innerHTML = "";
        for (const key in coleccionPorClase) {
            let mov = coleccionPorClase[key];
            let ceYaPoseida = coleccionPj.find(el => el == mov);
            if (ceYaPoseida == undefined) {
                let form = document.createElement("div");
                form.class = "form-check";
                let elemento = coleccionDatos.find(el => el.id == mov);
                let idMov = `px_${mov}`;
                form.innerHTML = `<input class="form-check-input" type="radio" name="flexRadio1" id="${idMov}" />
                                  <label class="form-check-label" for="${idMov}" data-toggle="tooltip" data-html="true" title="${elemento.descripcion}">${elemento.nombre}</label>`;
                placeHolder.insertAdjacentElement("beforeend", form);
            }
        }
    };
    let movs = personajes[pjSeleccionado.clase].movimientos;
    let cePlaceHolderPX = document.getElementById('cePlaceHolderPX');

    crearInputs(movs, pjSeleccionado.movimientos, movimientos, cePlaceHolderPX);

    let equipos = personajes[pjSeleccionado.clase].equipo;
    let equiposPlaceHolderPX = document.getElementById('equipoPlaceHolderPX');
    crearInputs(equipos, pjSeleccionado.equipo, equipo, equiposPlaceHolderPX);

    $('#pxModal').modal('show');

}

function redirectPersonajes() {
    let juegoEscogido = getSelectValue(document.getElementById("juegoEscogido"));
    redirigirPagina("personaje?juegoEscogido=" + juegoEscogido);
}


function exportarPj(id) {

    let personajesFW = JSON.parse(localStorage.getItem("personajesFW"));
    let personajeGuardadoId = personajesFW[id];
    let pjGuardado = localStorage.getItem(personajeGuardadoId);
    let pjJson = JSON.parse(pjGuardado);

    writeFile(pjJson.nombre + ".pj", pjJson);

    alert(pjJson.nombre + " exportado");
}


function importarPersonaje() {
    console.log('importarPersonaje ');
    let reader = loadFile();
    reader.onloadend = () => {
        let result = reader.result;
        let personaje = JSON.parse(result);
        let personajesFW = JSON.parse(localStorage.getItem("personajesFW"));
        if (personajesFW == null) {
            personajesFW = [];
        }
        let encontrada = personajesFW.find(elemento => personaje.id == elemento);

        if (encontrada == undefined) {
            personajesFW.push(personaje.id);
            localStorage.setItem("personajesFW", JSON.stringify(personajesFW));
            localStorage.setItem(personaje.id, result);
        }

        alert(personaje.nombre + " Importado");
        location.reload();
    };

}