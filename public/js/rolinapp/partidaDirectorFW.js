/*jshint esversion: 6 */
pjSeleccionado = {
    id: 0
};

let pjJugadorSel;

function comprobarJugadoresDisponibles() {
    idIntervalCambiosJugadores = window.setInterval(consultarCambiosListadoJugadores, CINCO_SEGUNDOS);
    // console.log("creado interval con id " + idIntervalCambiosJugadores);
}

// metodo para comprobar si hay jugadores que se quieren unir a nuestra partida. esta debe ser 
function consultarCambiosListadoJugadores() {
    // console.log("consultarCambiosListadoJugadores " + idIntervalCambiosJugadores);
    // mientras se esta esperando para aceptar cambiarClasePersonaje, se deberia para la ejecucion de solicitudes
    let resolver = function(successMessage) {
        //console.log("3- consultarCambiosListadoJugadores: resolver " + JSON.stringify(successMessage));
        document.getElementById('addPj').style.display = "block";
        document.getElementById('pjInfoPreAceptar').innerHTML = "";
        pjJugadorSel = JSON.parse(successMessage.pjs);
        document.getElementById('pjRecuperado').style.display = "none";

        partida.personajes.forEach(personaje => {
            if (personaje.id == pjJugadorSel.id) {
                pjSelepjJugadorSelccionado = personaje; //partida.personajes.find(pj => pj.id == personaje);
                document.getElementById('pjRecuperado').style.display = "block";
            }
        });

        // console.log("dando valor a pj selceccionado ");
        // console.log(pjSeleccionado);
        insertaPJenHtml(pjJugadorSel, 'pjInfoPreAceptar');
        // insertaPJenHtml(pjSeleccionado, 'pjInfoPreAceptar', 0);
        document.getElementById('nombrePJ').innerHTML = "<b>" + pjJugadorSel.nombre + "</b>";
        // // console.log("Limpiando interval para consultarCambiosListadoJugadores " + idIntervalCambiosJugadores);
        window.clearInterval(idIntervalCambiosJugadores);
    };

    if (partida.publica) {
        consultar("SERVER-partida&consultarCambiosListadoJugadores=" + partida.id, resolver, notOK);
    } else {
        // // console.log("Limpiando interval para consultarCambiosListadoJugadores " + idIntervalCambiosJugadores);
        window.clearInterval(idIntervalCambiosJugadores);
    }

}


function aceptarPJ() {
    // console.log("ENTRA EN aceptarPJ");
    let addPj = true;
    partida.personajesActuales.forEach(personaje => {
        if (personaje == pjJugadorSel.id) {
            addPj = false;
        }
    });
    if (addPj) {
        partida.personajesActuales.push(pjJugadorSel.id);
        partida.personajes.push(pjJugadorSel);
    }


    insertaPJenHtml(pjJugadorSel, 'accordion');
    document.getElementById('addPj').style.display = "none";
    //informar para eliminar el pj del listado y que se informe al pj que esta en partida.
    //lanzamos solicitud unirse partida
    let resolver = function(successMessage) {
        // // console.log("3- aceptarPJ: resolver " + JSON.stringify(successMessage));
        comprobarJugadoresDisponibles();
    };
    //enviamos los pjs
    let solicitudAceptarPJ = {
        pjs: JSON.stringify(partida.personajes),
        partidaID: partida.id,
        idJugador: pjJugadorSel.id
    };
    // document.getElementById('iniciarPartida').style.display = "block";

    solicitar("SERVER-partida&solicitarAceptarPJ", resolver, notOK, solicitudAceptarPJ);

}

// con este boton dejamos de buscar jugadores y privatizamos la partida
function iniciarPartidaMaster() {
    console.log("iniciarPartidaMaster");
    if (partida.publica) {
        console.log("Entra en primera opcion publica = true");
        pjJugadorSel = null;
        partida.publica = false;
        // metodo para dejar de publicar partida y que el server deje de indicar a los jugadores que hay una partida disponible
        let comp = document.getElementById('publica');
        comp.innerText = 'Privada';
        comp.classList = "fa fa-align-right p-1 mb-3 bg-danger text-white";
        document.getElementById('iniciarPartida').innerText = "Publicar Partida";
        // document.getElementById('iniciarPartida').style.display = "none";
        //mostramos los checks
        document.getElementById('checks').style.display = "block";
        // console.log("pjs");
        let root = document.getElementById('accordion');
        let pjsIncluidos = root.childElementCount;


        partida.personajesActuales.forEach(personaje => {
            for (let item of document.getElementsByName('selPjChecks')) {
                let noEncontrado = true;
                for (let item2 of item.children) {
                    for (let item3 of item2.children) {
                        if (item3.type == "radio") {
                            if (item3.value == personaje) {
                                noEncontrado = false;
                            }
                        }
                    }
                }
                if (noEncontrado) {
                    let pj = partida.personajes.find(element => element.id == personaje);
                    selectoresPjsHTML(pj.id, pj.nombre, 'selPjChecks');
                }
            }


            if (pjsIncluidos == 0) {
                insertaPJenHtml(partida.personajes.find(element => element.id == personaje), 'accordion');
            }

            // 
        });

        // console.log("pnjs");
        partida.pnjsEscena.forEach(personaje => {
            for (let item of document.getElementsByName('selPnjChecks')) {
                let noEncontrado = true;
                for (let item2 of item.children) {
                    for (let item3 of item2.children) {
                        if (item3.type == "radio") {
                            if (item3.value == personaje.id) {
                                noEncontrado = false;
                            }
                        }
                    }
                }
                if (noEncontrado) selectoresPnjsHTML(personaje.id, personaje.nombre, 'selPnjChecks');
            }
        });

        cargarConsecuenciasEnPagina();


        cargarPJsSelectorPjsEquipo();
        localStorage.setItem("partidaActiva", partida.id);
        let resolver = function(successMessage) {
            this.partida = successMessage;
        };

        let solicitudPrivatizarPartida = {
            idPartida: partida.id,
            publica: false
        };

        actualizarListadoPjsIniciativaNarrativa();

        solicitar("SERVER-partida&solicitarPrivatizarPartida", resolver, notOK, solicitudPrivatizarPartida);
        let fechaInicio = new Date(Date.now()).toLocaleDateString();
        let date = new Date();
        fechaInicio += " a las " + date.getHours() + ":" + date.getMinutes();
        let mensaje = `<td>Director de Juego</td><td>Da inicio a la partida. ${fechaInicio}</td>`;
        let solicitudPublicarChecks = {
            ESTATUS: "HISTORICO",
            ID_PARTIDA: partida.id,
            ID_JUGADOR: 0,
            RESPUESTA: mensaje,
            CONTADOR: contadorResultadoActual++
        };
        resolver = function(successMessage) {
            if (successMessage.code == "OK")
                historificarResultado(solicitudPublicarChecks);
        };

        solicitar("SERVER-partida&publicarResultado", resolver, notOK, solicitudPublicarChecks);
    } else {
        console.log("Entra en segunda opcion publica = false");
        partida.publica = true;
        let comp = document.getElementById('publica');
        document.getElementById('iniciarPartida').innerText = "Privatizar Partida";
        comp.innerText = 'Publica';
        comp.classList = "fa fa-align-right p-1 mb-3 bg-success text-white";
        let fechaInicio = new Date(Date.now()).toLocaleDateString();
        let date = new Date();
        fechaInicio += " a las " + date.getHours() + ":" + date.getMinutes();
        let mensaje = `<td>Director de Juego</td><td>Publica la partida para buscar jugadores. ${fechaInicio}</td>`;
        let solicitudPublicarChecks = {
            ESTATUS: "HISTORICO",
            ID_PARTIDA: partida.id,
            ID_JUGADOR: 0,
            RESPUESTA: mensaje,
            CONTADOR: contadorResultadoActual++
        };
        resolver = function(successMessage) {
            if (successMessage.code == "OK")
                historificarResultado(solicitudPublicarChecks);
        };

        solicitar("SERVER-partida&publicarResultado", resolver, notOK, solicitudPublicarChecks);
        resolver = function(successMessage) {
            this.partida = successMessage;
        };

        let solicitudPrivatizarPartida = {
            idPartida: partida.id,
            publica: true
        };


        solicitar("SERVER-partida&solicitarPrivatizarPartida", resolver, notOK, solicitudPrivatizarPartida);
        comprobarJugadoresDisponibles();
        //hay que corregir puntos, quizas el boton ya no debe llamar a iniciarPartidaMaster, porque se repiten muchos elementos como los pnjs, etc
    }
    bucleConsultasJugador();
}


function solicitarCheck() {

    document.getElementById("btnSolicitarCheck").disabled = true;

    let habsChecks = document.getElementsByName("flexRadioDefault");
    let difChecks = document.getElementsByName("flexRadioDefault2");
    let pjsChecks = document.getElementById("checksPjs");
    let pnjsChecks = document.getElementById("checksPnjs");
    let hab;
    let dif;
    let pj;
    let isPnj = false;
    for (let item of habsChecks) {
        if (item.checked) hab = item.id;
    }
    for (let item of difChecks) {
        if (item.checked) dif = item.id;
    }
    for (let item of pjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) pj = item2.value;
        }
    }
    for (let item of pnjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) {
                isPnj = true;
                pj = item2.value;
            }
        }
    }
    setTimeout(() => {
        document.getElementById("btnSolicitarCheck").disabled = false;
        for (let item of habsChecks) {
            item.checked = false;
        }
        for (let item of difChecks) {
            if (item.id == "media") item.checked = true;
            else
                item.checked = false;
        }
        for (let item of pjsChecks.children) {
            for (let item2 of item.children) {
                item2.checked = false;
            }
        }
        for (let item of pnjsChecks.children) {
            for (let item2 of item.children) {
                item2.checked = false;
            }
        }
    }, UN_SEGUNDO);

    let solicitarCheckJSON = {
        idPartida: partida.id,
        tipo: "check",
        habSel: hab,
        difSel: dif,
        pjSel: pj,
        contador: contadorResultadoActual++
    };
    // si se trata de un pnj no hay que hacer solicitud, sino levantar al master la ventana de respuesta a solicitud de checks
    if (isPnj) {
        solicitarCheckJSON = {
            idPartida: partida.id,
            tipo: "check",
            SOLICITUD: { habSel: hab, difSel: dif },
            RESPUESTA: [],
            ID_JUGADOR: pj,
            contador: contadorResultadoActual++
        };
        let pnj = partida.pnjsEscena.find(p => p.id == pj);

        let mods = [];
        pnj.movimientos.map((mov) => {
            let findMov = movimientos.find(pnjsMov => pnjsMov.id == mov);
            if (findMov != undefined && findMov.palo == hab)
                mods.push(findMov.id);
        });
        pnj.equipo.map((equipoPnj) => {
            let piezaEquipo = equipo.find((eq) => eq.id == equipoPnj);
            if (piezaEquipo.palo == solicitarCheckJSON.SOLICITUD.habSel) { mods.push(equipoPnj); }
        });

        solicitarCheckJSON.RESPUESTA = JSON.stringify(mods);
        popUpCheckAceptado(solicitarCheckJSON, pnj);
    } else {
        let resolver = function(successMessage) {
            consultarChecksAceptados();
        };

        solicitar("SERVER-partida&solicitarCheck", resolver, notOK, solicitarCheckJSON);
    }

}

//metodo del master que inicia el bucle para consultar si tenemos checks respondidos por parte del jugador.
//reutilizamos idIntervalconsultarPartidasPublicadasPeticion para este proposito
function consultarChecksAceptados() {
    // // console.log("iniciando bucle de consultarChecksAceptados");
    idIntervalCambiosJugadores = window.setInterval(consultarChecksAceptadosBucle, CINCO_SEGUNDOS);
    // // console.log("creado interval consultarChecksAceptadosConID con id " + idIntervalCambiosJugadores);
}

function consultarChecksAceptadosBucle() {
    // // console.log("consultarChecksAceptadosBucle");

    let resolver = function(successMessage) {
        console.log("3- consultarChecksAceptados: resolver " + JSON.stringify(successMessage));
        if (successMessage.checks.SOLICITUD == "DUELO") {
            let respuesta = JSON.parse(successMessage.checks.RESPUESTA);
            duelo.push({
                id: successMessage.checks.ID_JUGADOR,
                opcionSeleccionada: respuesta.opcion,
                opcionesMods: respuesta.mods
            });
            window.clearInterval(idIntervalCambiosJugadores);
            if (duelo.length > 1) {
                ejecutarDuelo();
            }
        } else {
            // 3- consultarChecksAceptados: resolver {"code":"OK","checks":{"ID":125,"ID_PARTIDA":1689847688434,"ID_JUGADOR":1681747011095,"SOLICITUD":{"difSel":"media","habSel":"picas"},"RESPUESTA":["revolver"],"ESTADO":"ACEPTADO","FECHA":"2023-07-19T22:00:00.000Z","CONTADOR":1}}
            let respuestaCheck = successMessage.checks;
            let pj = partida.personajesActuales.find(element => respuestaCheck.ID_JUGADOR == element);
            let jugador = partida.personajes.find(element => element.id == pj);
            popUpCheckAceptado(respuestaCheck, jugador);
            // console.log("Limpiando interval para consultarChecksAceptados " + idIntervalCambiosJugadores);
            window.clearInterval(idIntervalCambiosJugadores);
            idIntervalCambiosJugadores = 0;
            checkSolicitado = successMessage;
        }

    };

    if (idIntervalCambiosJugadores > 0) {
        consultar("SERVER-partida&consultarChecksAceptados=" + partida.id, resolver, notOK);
    }

}


function popUpCheckAceptado(respuestaCheck, personaje) {
    //3- consultarChecksAceptados: resolver {"code":"OK","checks":{
    //"ID":125,"ID_PARTIDA":1689847688434,"ID_JUGADOR":1681747011095,"SOLICITUD":{"difSel":"media","habSel":"picas"},"RESPUESTA":["revolver"],"ESTADO":"ACEPTADO","FECHA":"2023-07-19T22:00:00.000Z","CONTADOR":1}}
    document.getElementById("habCheckTiradas").innerText = "";
    let solicitud = respuestaCheck.SOLICITUD;
    if (typeof respuestaCheck.SOLICITUD == 'string') {
        solicitud = JSON.parse(respuestaCheck.SOLICITUD);
    }
    document.getElementById("habCheckSel").innerText = descripcion_habilidades[solicitud.habSel];

    let habImg = "picas";
    if (solicitud.habSel == "corazones") {
        habImg = "corazones";
    } else if (solicitud.habSel == "treboles") {
        habImg = "treboles";
    } else if (solicitud.habSel == "diamantes") {
        habImg = "diamantes";
    }
    document.getElementById("imgHab").innerHTML = `<img src="../imagenes/rolinapp/${habImg}.png" style="width: 20px; height:auto;" />`;
    document.getElementById("pjCheckSel").innerText = personaje.nombre;
    document.getElementById("difCheckSel").innerText = descripcion_dificultad[solicitud.difSel];
    propuestaCheckJugador = respuestaCheck;
    let bloqueCE = document.getElementById("ceAplicables");
    bloqueCE.style.display = "none";
    let bloqueEquipo = document.getElementById("equipoAplicables");
    bloqueEquipo.style.display = "none";
    let rootCE = document.getElementById("cePlaceHolder");
    rootCE.innerHTML = "";
    let rootEquipo = document.getElementById("equipoPlaceHolder");
    rootEquipo.innerHTML = "";
    document.getElementById("habCheckResultado").innerText = " ";
    document.getElementById("habCheckInfoMensaje").innerText = " Selecciona que opciones aceptas para el check y pulsa 'Aceptar'";

    document.getElementById("cmAsegurarTiro").style.display = "none";
    document.getElementById("cmTodoNada").style.display = "none";
    document.getElementById("checkModExtras").style.display = "none";
    document.getElementById("habCheckResultadoParciales").innerHTML = "";
    //hay que mostrar las modificaciones al check del jugador 

    let respuesta = JSON.parse(respuestaCheck.RESPUESTA);
    if (respuesta.length > 0) {
        document.getElementById("aceptarPropuestaBtn").style.display = "block";
        document.getElementById("publicarBtn").style.display = "none";
        document.getElementById("habCheckForzarResultado").style.display = "none";
        // actitud
        JSON.parse(respuestaCheck.RESPUESTA).filter((mod) => {

            let ceAñadido = addHtmlElementDeColeccionFiltrandoPorID(personaje.movimientos, mod, rootCE);
            if (ceAñadido > 0) {
                bloqueCE.style.display = "block";
            } else {
                let equipoAñadido = addHtmlElementDeColeccionFiltrandoPorID(personaje.equipo, mod, rootEquipo);
                if (equipoAñadido > 0) {
                    bloqueEquipo.style.display = "block";
                }
            }
            if (document.getElementById(mod) != undefined) {
                document.getElementById("checkModExtras").style.display = "block";
                document.getElementById(mod).style.display = "block";
            }
        });

    } else {
        calcularResultadoAccion();
        document.getElementById("publicarBtn").style.display = "block";
        document.getElementById("habCheckForzarResultado").style.display = "block";
    }

    //mostrar el modal
    $('#solicitudCheckModal').modal('show');
}


function aceptarPropuestaChecks() {
    // propuestaCheckJugador
    //"ID":125,"ID_PARTIDA":1689847688434,"ID_JUGADOR":1681747011095,"SOLICITUD":{"difSel":"media","habSel":"picas"},"RESPUESTA":["revolver"],"ESTADO":"ACEPTADO","FECHA":"2023-07-19T22:00:00.000Z","CONTADOR":1}}
    // tenemos en cuenta si el master a marcado alguna accion y procedemos a calcular el resultado
    JSON.parse(propuestaCheckJugador.RESPUESTA).filter((mod) => {
        if (document.getElementById(mod).checked != undefined)
            mod.checked = document.getElementById(mod).checked;
    });

    document.getElementById("aceptarPropuestaBtn").style.display = "none";
    document.getElementById("publicarBtn").style.display = "block";
    document.getElementById("habCheckForzarResultado").style.display = "block";
    calcularResultadoAccion();
}

function publicarResultado() {
    console.log("publicarResultado ", resultadoPublicar);

    let solicitud = resultadoPublicar.check.SOLICITUD;
    if (typeof resultadoPublicar.check.SOLICITUD == 'string') {
        solicitud = JSON.parse(resultadoPublicar.check.SOLICITUD);
    }
    let pj = partida.personajesActuales.find(element => resultadoPublicar.check.ID_JUGADOR == element);
    let jugador = partida.personajes.find(element => element.id == pj);

    if (jugador == undefined) {
        jugador = partida.pnjsEscena.find(p => p.id == resultadoPublicar.check.ID_JUGADOR);
    }
    let dificultad = descripcion_dificultad[solicitud.difSel];
    let habImg = "picas";
    if (solicitud.habSel == "corazones") {
        habImg = "corazones";
    } else if (solicitud.habSel == "treboles") {
        habImg = "treboles";
    } else if (solicitud.habSel == "diamantes") {
        habImg = "diamantes";
    }
    for (let item of document.getElementById("forzarResultadoSelect")) {
        if (item.selected) {
            resultadoPublicar.gradoExito = item.value;
        }
    }

    let hab = `<img src=\"../imagenes/rolinapp/${habImg}.png\" style=\"width: 20px; height:auto;\" />`;
    let result = RES_ACCION_LITERAL[resultadoPublicar.gradoExito].toUpperCase();

    let parcialesInfo = "";
    let elements = document.getElementsByName("parciales");
    for (let item of elements) {
        if (item.checked) {
            parcialesInfo = aplicarConsecuenciaInmediata(item.id, jugador);
            cargarConsecuenciasEnPagina();
        }
    }
    //esto es para informar en el cuadro de daño el ultimo check con exito por si queremos usar los datos de este pj como fuente de daño
    if (resultadoPublicar.gradoExito > 0) {
        document.getElementById('lastCheckID').style.display = "block";
        document.getElementById('lastCheckPj').innerHTML = ` <b>${hab}</b> efectuado por <b>${jugador.nombre}</b>`;
    } else {
        document.getElementById('lastCheckID').style.display = "none";
    }


    let mensaje = `<td>${jugador.nombre}</td><td>Check de habilidad ${hab} a dificultad <b>${dificultad}</b> con resultado: <b>${result}</b>. ${parcialesInfo}</td>`;
    let solicitudPublicarChecks = {
        ESTATUS: "HISTORICO",
        ID_PARTIDA: partida.id,
        ID_JUGADOR: jugador.id,
        SOLICITUD: jugador,
        RESPUESTA: mensaje,
        CONTADOR: contadorResultadoActual++
    };
    let resolver = function(successMessage) {
        if (successMessage.code == "OK")
            historificarResultado(solicitudPublicarChecks);
    };

    solicitar("SERVER-partida&publicarResultado", resolver, notOK, solicitudPublicarChecks);
}