/*jshint esversion: 6 */

let partida;
let CONTROL_CONSULTAR_PARTIDAS_PUBLICADAS = true;
//jugador
let listaPartidasJDisponibles;
let idIntervalCambiosJugadores;
let idIntervalconsultarPartidasPublicadasPeticion;
let idIntervalconsultarJugadorAceptado = 0;
let idIntervalconsultarconsultarResultadoPublicado = 0;
let consultarPartidasPublicadasPeticionControl = true;
let pjSeleccionado;
let checkSolicitado;
let resultadoPublicar;
let contadorResultadoActual = 0;
let propuestaCheckJugador;
let controlBoolean = true;


let notOK = function(mensaje) {
    console.log("notOK ", mensaje);
};

function partidaHTML(valor) {
    let htmlPartidaBase = ` <div class="card">
    <div class="badge badge-pill badge-info" id="heading${valor}">
        <h5 class="mb-0"> <button id="partida_${valor}" class="btn btn-link  text-light" data-toggle="collapse" data-target="#collapse${valor}" aria-expanded="true" aria-controls="collapse${valor}" /> </h5>
    </div>
</div>
<div id="collapse${valor}" class="collapse border border-secondary" aria-labelledby="heading${valor}" data-parent="#accordion">
    <div id="descripcion_${valor}" class="card-body form-check" style="display: block;">
        <div class="card-header">
            <div class="row">
                <div class="col" id="juego_${valor}">foto</div>
            </div>
            <div class="row">
                <div class="col text-left"><span><b>Nombre: </b></span><span id="nombre_${valor}"></span></div>
            </div>
            <div class="row">
                <div class="col text-left"><span><b>Notas: </b></span><span id="notas_${valor}" /></div>
            </div>
            <p></p>
            <div class="row">
                <div class="col">
                    <div><b>Jugadores</b> </div>
                    <div id="pjs_${valor}"> </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div><b>Pnjs Creados</b> </div>
                    <div id="pnjs_${valor}"> </div>
                </div>
            </div>
            <div class="row">
                <div class="modal fade" id="exampleModalCenter${valor}" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-body"> ¿Seguro que quieres borrar la partida? </div>
                            <div class="modal-footer"> <button type="button" class="btn btn-danger" data-dismiss="modal" onclick="borrarPartida(${valor})">Borrar</button> <button type="button" class="btn btn-secondary" data-dismiss="modal">Cerrar</button>                                                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">Fecha de Creacion: <span id="creacion_${valor}" /> </div>
            <div class="row">Ultima Partida: <span id="ultimaPartida_${valor}" /></div>

        </div>
        <div class="row bg-secondary p-1">
            <div class="col"> <button type="button" class="btn btn rounded-pill btn-danger" data-toggle="modal" data-target="#exampleModalCenter${valor}"> Borrar </button></div>
            <div class="col"> <button type="button" class="btn" onclick="exportarPartida(${valor})">Exportar</button> </div>
            <div class="col"> <button type="button" class="btn btn-success" data-dismiss="modal" onclick="iniciarPartida(${valor})">Empezar</button> </div>
        </div>
    </div>
</div>`;

    let root = document.getElementById('accordion');
    let div = document.createElement('div');
    div.innerHTML = htmlPartidaBase;

    root.insertAdjacentElement("beforeend", div);
}

function partidaHTMLJugador(valor) {
    let htmlPartidaBase = `<div class="card"> <div class="badge badge-pill badge-info" id="headingPjPartida${valor}"> <h5 class="mb-0"> <button id="partida_${valor}" class="btn btn-link  text-light" data-toggle="collapse" data-target="#collapsePjPartida${valor}" aria-expanded="true" aria-controls="collapsePjPartida${valor}"/> </h5> </div> </div> <div id="collapsePjPartida${valor}" class="collapse border border-secondary" aria-labelledby="headingPjPartida${valor}" data-parent="#accordion"> <div id="descripcion_${valor}" class="card-body form-check" style="display: none;"> <div class="row"> <div class="col" id="juego_${valor}">foto</div> </div> <div class="row"> <div class="col"> <i id="notas_${valor}"></i> </div> </div> <div class="row"> <div class="col"> <b>Jugadores</b> <span id="pjs_${valor}"/> </div> </div> <div class="row"> <div class="col"> <div class="row">Seleciona un personaje para esta partida</div> <div class="input-group"> <select class="custom-select" id="inputGroupSelect04" aria-label=""> <option id="optionRoot" class="optionRoot_${valor}" value="0" selected>Escoje un pj...</option></select> <div class="input-group-append"> <button type="button" class="btn btn-success" data-dismiss="modal" onclick="unirsePartida(${valor})">Unirse</button> </select></div> </div> </div> </div> </div> </div>`;

    let root = document.getElementById('accordion_partidas');
    let div = document.createElement('div');
    div.innerHTML = htmlPartidaBase;

    root.insertAdjacentElement("beforeend", div);

    //ahora los pjs

    let fnOpcionesPJs = (posicionBucle, personaje) => {
        let pj = personaje.nombre + " " + personaje.clase;
        // // // console.log(pj);
        root = document.querySelector(".optionRoot_" + valor);
        if (root != null) {
            div = document.createElement('option');
            div.id = "pj_" + posicionBucle;
            div.value = personaje.id;
            div.innerText = pj;
            root.insertAdjacentElement("afterend", div);
        }
    };
    ciclarPjs(fnOpcionesPJs);
}

function ciclarPjs(fn, comparatorID, map) {

    let personajesFW = JSON.parse(localStorage.getItem("personajesFW"));
    if (personajesFW == undefined || personajesFW == null) {
        personajesFW = [];
    }
    let i = 0;
    personajesFW.map(personajeGuardadoId => {
        let pjGuardado = localStorage.getItem(personajeGuardadoId);
        if (pjGuardado != null) {
            let personaje = JSON.parse(pjGuardado);
            fn(i++, personaje, comparatorID, map);
        }
    });

}

function recuperarPartida() {
    console.log("recuperarPartida");
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    cargarDescripcionesPersonajes();
    let partidaID = "partidaFW_" + urlParams.get('partida');

    partida = JSON.parse(localStorage.getItem(partidaID));
    if (partida != null) {
        document.getElementById('logoJuego').innerHTML = `<img class="w-75" src="../imagenes/rolinapp/logo${partida.juego}horizontal.png" />`;
        document.getElementById('nombre').innerText = partida.nombre;
        document.getElementById('notas').value = partida.notas;
        document.getElementById('fechaCreacion').innerText = partida.fechaCreacion;
        document.getElementById('fechaGuardado').innerText = partida.ultimaPartida.split("T")[0];
        console.log("partida.publica:", partida.publica);
        let partidaPublica = partida.publica;
        publicarPartida();
        console.log("partidaPublica: ", partidaPublica);
        if (!partidaPublica) {
            partida.publica = !partidaPublica;
            setTimeout(iniciarPartidaMaster, UN_SEGUNDO);

        }
    }
}

// esto lo hacemo la primera vez que cargamos la pagina indicando al server que tenemos una partida lista esperando jugadores

function publicarPartida() {
    console.log("publicarPartida");

    let resolver = function(successMessage) {

        console.log("3- publicarPartida: resolver " + JSON.stringify(successMessage));

        // de momento vamos a pintar lo que nos digan en la pagina
        let comp = document.getElementById('publica');
        comp.className = "p-1 mb-3 text-white bg-success";
        comp.innerText = 'Publicada';
        partida.publica = true;
        comprobarJugadoresDisponibles();
    };

    let notOK = function() {
        let comp = document.getElementById('publica');
        comp.innerText = 'La Partida YA esta publicada';
        setTimeout(function() {
            let comp = document.getElementById('publica');
            comp.className = "p-1 mb-3 text-white bg-success";
            comp.innerText = 'Publicada';
        }, CINCO_SEGUNDOS);
        comprobarJugadoresDisponibles();
    };

    solicitar("SERVER-partida&publicar", resolver, notOK, partida);
    cargarPnjs();
    cargarEquipo();
}

function listarPartidasPublicadas(listaPartidasJSON) {
    //console.log("listarPartidasPublicadas ", listaPartidasJSON);
    let i = listaPartidasJDisponibles != undefined ? listaPartidasJDisponibles.length : 0;
    if (listaPartidasJSON.partidas.length > 0) {

        listaPartidasJSON.partidas.map((nuevaPartida) => {
            let noEncontrado = true;
            if (listaPartidasJDisponibles != undefined) {
                listaPartidasJDisponibles.filter((partidaYaDisponibles) => {
                    // console.log("nuevaPartida.id " + nuevaPartida.id + " :: partidaYaDisponibles.id " + partidaYaDisponibles.id);
                    if (nuevaPartida.id == partidaYaDisponibles.id) {
                        noEncontrado = false;
                    }
                });
            }

            if (noEncontrado) {
                // console.log("Entra en No Encontrado con id " + nuevaPartida.id + " partida con nombre " + nuevaPartida.nombre + " y posicion i " + i);
                partidaHTMLJugador(i);
                document.getElementById('descripcion_' + i).style = "block";
                document.getElementById('partida_' + i).innerText = nuevaPartida.nombre;
                //falta poner la descripcion de la partida y el icono del juego
                document.getElementById('notas_' + i).innerText = nuevaPartida.notas;
                document.getElementById('juego_' + i).innerHTML = `<img class="w-50 img-fluid rounded float" src="../imagenes/rolinapp/logo${nuevaPartida.juego}horizontal.png" />`;
                i++;
            } else {
                // console.log("No hay partidas nuevas");
            }
        });
    }

    listaPartidasJDisponibles = listaPartidasJSON.partidas;

}
//metodo master para recuperar partida anterior
function recuperarPartidaMaster() {
    partida = JSON.parse(localStorage.getItem("partidaActiva"));
    iniciarPartidaMaster();
}

/**funcion del jugador para tratar de reconectarse a la ultima partida que asistio. */
function reconectarUltimaPartida() {

    let ultimaPartida = JSON.parse(localStorage.getItem("ultimaPartida"));

    let resolver = function(successMessage) {
        redirigirPagina("partida?idPartida=" + ultimaPartida.idPartida + "&idPj=" + ultimaPartida.pjID);
    };

    let notOK = function() {
        localStorage.setItem("ultimaPartida", null);
        alert("No se ha encontrado la ultima partida en activo.");
        document.getElementById("ultimaPartidaInfo").style.display = "none";
    };

    consultar("SERVER-partida&consultarPartidaActiva=" + ultimaPartida.idPartida, resolver, notOK);

}

function unirsePartida(id) {
    //hay que levantar un popup de seleccion de pj
    let pjSel = document.getElementById("inputGroupSelect04").selectedOptions[0].value;
    if (pjSel != 0) {
        // let mapPj = [];
        console.log(pjSel);
        let solicitudUnirse = {};
        listaPartidasJDisponibles.map((element, index) => {
            if (index == id) {
                partida = element.id;
                solicitudUnirse.id = element.id;
            }
        });
        let map = [];
        let fn = (posicionBucle, personaje, pjSel, map) => {
            // // // console.log(personaje.id);
            if (personaje.id == pjSel) {
                // // console.log("encontrado");
                map.push(personaje);
            }
        };
        ciclarPjs(fn, pjSel, map);
        solicitudUnirse.pj = map[0];
        pjSeleccionado = solicitudUnirse.pj;
        console.log(pjSeleccionado);
        console.log(solicitudUnirse);
        //lanzamos solicitud unirse partida
        let resolver = function(successMessage) {
            let root = document.getElementById('accordion_partidas');
            root.innerHTML = "<b>Solicitud de Unirse a partida realizada con exito, por favor espere.</b>";
            document.getElementById('btnCrearPj').disabled = "disabled";
            consultarPartidasPublicadasPeticionControl = false;
        };

        let notOK = function() {
            alert("Ha sucedido un error en su peticion de unirse a la partida");
        };

        solicitar("SERVER-partida&solicitarUnirsePartida", resolver, notOK, solicitudUnirse);

    }
}



function cargarConsecuenciasEnPagina() {
    let rootName = document.getElementById('consecuencias');
    rootName.innerHTML = "";
    if (rootName.children.length == 0) {
        Object.keys(consecuencias).map((consecuenciaKey) => {
            // // console.log(consecuenciaKey);
            let consecuencia = consecuencias[consecuenciaKey];
            let contadorVecesConsecuencia = contadorConsecuenciasEmpleadas[consecuenciaKey];
            let htmlConsecuencia = `<input class="form-check-input" type="radio" name="consecuenciaInput" id="${consecuenciaKey}">
            <label class="form-check-label" for="${consecuenciaKey}" data-toggle="tooltip" data-html="true" title="${consecuencia.descripcion}"><b>${contadorVecesConsecuencia} - ${consecuencia.nombre}</b></label>`;
            addHtmlElement(htmlConsecuencia, rootName);
        });
    }
}




function historificarResultado(resultado) {
    console.log("historificarResultado ", resultado);

    if (resultado.CONTADOR > 0)
        contadorResultadoActual = resultado.CONTADOR;
    contadorResultadoActual++;
    let jugador;
    if (resultado.ID_JUGADOR != 0) {


        if (partida.personajes.filter(pj => resultado.ID_JUGADOR == pj.id)[0] != undefined && resultado.SOLICITUD != null) {
            partida.personajes = partida.personajes.filter(pj => resultado.ID_JUGADOR != pj.id);
            if (typeof resultado.SOLICITUD == 'string') {
                jugador = JSON.parse(resultado.SOLICITUD);
            } else { jugador = resultado.SOLICITUD; }


            partida.personajes.push(jugador);
            document.getElementById('accordion').innerHTML = "";
            if (tipoJugador != "master") {
                console.log("jugador ", jugador);
                if (pjSeleccionado.id == jugador.id) {
                    pjSeleccionado = jugador;
                }
                document.getElementById('jugador').innerHTML = "";
            }

            partida.personajes.map((pj) => {

                // if (pjSeleccionado == undefined || pjSeleccionado == null) {
                //     insertaPJenHtml(pj, 'accordion');
                // } else 
                if (pjSeleccionado != undefined && pj.id == pjSeleccionado.id) {
                    insertaPJenHtml(pjSeleccionado, 'jugador');
                } else { insertaPJenHtml(pj, 'accordion'); }
            });
        } else {
            if (tipoJugador == "master")
                updateVisor(resultado.ID_JUGADOR);
        }

    }

    let root = document.getElementById('cuerpoTablaResultados');
    let div = document.createElement('tr');
    div.innerHTML = resultado.RESPUESTA;

    root.insertAdjacentElement("afterbegin", div);

}

function realizarTiradas() {
    let numDados = document.getElementById("numDados").value;
    console.log(numDados);
    let pjID = 0;
    let pj = "Director";
    if (tipoJugador == "jugador") {
        pjID = pjSeleccionado.id;
        pj = pjSeleccionado;
    }
    const solicitarTiradas = {
        numDados: numDados,
        ID_PARTIDA: partida.id,
        ID_JUGADOR: pjID,
        pjSel: pj,
        CONTADOR: contadorResultadoActual++
    };
    let resolver = function(successMessage) {

        historificarResultado(successMessage.resultado);


    };

    solicitar("SERVER-partida&solicitarTiradas", resolver, notOK, solicitarTiradas);

}

//quiero unificar todas las consultas en una sola.
function bucleConsultasJugador() {

    const bucle = () => {
        console.log("consultasJugador");

        let resolver = function(successMessage) {
            console.log("3- consultasJugador: resolver " + JSON.stringify(successMessage));
            //           3- consultasJugador: resolver {"code":"OK","checks":{"ID":44,"ID_PARTIDA":1689847688434,"ID_JUGADOR":0,"SOLICITUD":null,"RESPUESTA":{"mensaje":"<td>Director de Juego</td><td>Da inicio a la partida. 20/7/2023 a las 12:26</td>"},"ESTADO":"HISTORICO","FECHA":"2023-07-19T22:00:00.000Z","CONTADOR":0}}
            // if (successMessage.checks.CONTADOR > 0)
            //     contadorResultadoActual = successMessage.checks.CONTADOR;
            successMessage.checks.forEach(element => {
                if (element.ESTADO == "CHECK") {
                    respuestaCheckSolicitado(element);
                } else if (element.ESTADO == "HISTORICO") {
                    historificarResultado(element);
                }
            });

        };

        let notOK = () => {
            console.log("3- consultasJugador: notOK ");
        };
        consultar("SERVER-partida&consultasParaJugador=" + pjSeleccionado.id + "&consultarResultadoPublicado=" + contadorResultadoActual + "&idPartida=" + partida.id, resolver, notOK);
        bucleConsultasJugador();
    };

    setTimeout(() => {
        bucle();
    }, CINCO_SEGUNDOS);
}

function aceptarCheck() {
    document.getElementById("check").style.display = "none";

    let resolver = function(successMessage) {
        // // console.log("3- aceptarCheck: resolver " + JSON.stringify(successMessage));
        //no se si esto toca ahora o cuando se reciba contestacion... quizas aqui se debe iniciar un consultarResoluciones
        // consultarChecks();
    };

    // let aceptarCheckJSON = checkSolicitado;
    //si hemos de indicar opciones por parte del jugador, las añadimos al aceptarCheckJSON
    // hay que obtener los hijos de estos elementos, y si estan checked, añadirlos a la respuesta
    let mods = [];
    let bucleNodos = (elementRoot) => {
        let ceNodes = elementRoot.childNodes;
        if (ceNodes != undefined) {
            for (let i = 0; i < ceNodes.length; i++) {
                let nodo = ceNodes[i];
                if (nodo.type == "checkbox") {
                    if (nodo.checked) {
                        mods.push(nodo.id);
                    }
                } else {
                    bucleNodos(nodo);
                }
            }
        }
    };
    bucleNodos(document.getElementById("cePlaceHolder"));
    bucleNodos(document.getElementById("equipoPlaceHolder"));
    // mods por actitud
    let actitud = (element) => {
        if (element.checked) {
            mods.push(element.id);
        }
    };

    actitud(document.getElementById("cmAsegurarTiro"));
    actitud(document.getElementById("cmTodoNada"));

    //   console.log(checkSolicitado);
    checkSolicitado.RESPUESTA = mods;
    solicitar("SERVER-partida&aceptarCheck", resolver, notOK, checkSolicitado);
    checkSolicitado = null;
}

function rechazarCheck() {
    checkSolicitado = null;
    // consultarChecks();
}