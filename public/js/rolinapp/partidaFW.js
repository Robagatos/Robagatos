/*jshint esversion: 6 */

// funciones solo del jugador


//metodo del jugador para comprobar si hay partidas publicadas
function consultarPartidasPublicadas() {
    console.log("consultarPartidasPublicadas");
    //comprobamos si hay una ultima partida guardada por si el jugador ha cerrado el navegador pueda volver a la partida.
    let ultimaPartida = localStorage.getItem("ultimaPartida");

    if (ultimaPartida != "undefined" && ultimaPartida != null)
        document.getElementById("ultimaPartidaInfo").style.display = "block";
    else
        document.getElementById("ultimaPartidaInfo").style.display = "none";

    consultarPartidasPublicadasPeticion();
    idIntervalconsultarPartidasPublicadasPeticion = window.setInterval(consultarPartidasPublicadasPeticion, CINCO_SEGUNDOS);
    // // console.log("creado interval consultarPartidasPublicadas con id " + idIntervalconsultarPartidasPublicadasPeticion);
}

function consultarPartidasPublicadasPeticion() {
    console.log("consultarPartidasPublicadasPeticion");
    let resolver = function(successMessage) {
        console.log("3- consultarPartidasPublicadas: resolver " + JSON.stringify(successMessage));
        listarPartidasPublicadas(successMessage);
    };

    if (consultarPartidasPublicadasPeticionControl) {
        consultar("SERVER-partida&consultarPartidasPublicadas", resolver, notOK);
    } else {
        console.log("Limpiando interval para idIntervalconsultarPartidasPublicadasPeticion " + idIntervalconsultarPartidasPublicadasPeticion);
        window.clearInterval(idIntervalconsultarPartidasPublicadasPeticion);
        consultarJugadorAceptado();
    }

}

//metodo del jugador para comprobar si ha sido aceptado o rechazado de una partida
function consultarJugadorAceptado() {
    idIntervalconsultarJugadorAceptado = window.setInterval(consultarJugadorAceptadoPeticion, CINCO_SEGUNDOS);
    // // console.log("creado interval consultarJugadorAceptado con id " + idIntervalconsultarJugadorAceptado);
}


function consultarJugadorAceptadoPeticion() {
    console.log("consultarJugadorAceptadoPeticion");

    let resolver = function(successMessage) {
        console.log("3- consultarJugadorAceptadoPeticion: resolver " + JSON.stringify(successMessage));

        idIntervalconsultarPartidasPublicadasPeticion = 0;
        // let ultimaPartida = {
        //     idPartida: successMessage.idPartida,
        //     pjID: pjSeleccionado.id
        // };

        // localStorage.setItem("ultimaPartida", JSON.stringify(ultimaPartida));

        redirigirPagina("partida?idPartida=" + successMessage.idPartida + "&idPj=" + pjSeleccionado.id);
    };

    if (idIntervalconsultarPartidasPublicadasPeticion > 0) {
        // // console.log(pjSeleccionado);
        let idPartida = partida;
        let idPj = pjSeleccionado.id;
        consultar("SERVER-partida&consultarJugadorAceptado=" + idPj + "&idPartida=" + idPartida, resolver, notOK);
    } else {
        // // console.log("Limpiando interval para idIntervalconsultarPartidasPublicadasPeticion " + idIntervalconsultarPartidasPublicadasPeticion);
        window.clearInterval(idIntervalconsultarPartidasPublicadasPeticion);
    }
}
//metodo del jugador que inicia el bucle para recuperar una partida publicada cuando ya está en partida y obtener todos los jugadores hasta que se privatice.
//reutilizamos idIntervalconsultarPartidasPublicadasPeticion para este proposito
function consultarRecuperarPartidaConParams() {
    let partidaActiva = localStorage.getItem("partidaActiva");
    if (partidaActiva != null || partidaActiva != undefined) {
        localStorage.setItem("partidaActiva", null);
    }
    cargarDescripcionesPersonajes();
    recuperarPartidaConParams();
}

//metodo del jugador para recuperar una partida publicada cuando ya está en partida.
function recuperarPartidaConParams() {
    if (consecuencias == undefined) {
        setTimeout(() => {
            recuperarPartidaConParams();
        }, UN_SEGUNDO);
    } else {

        let urlParams = new URLSearchParams(window.location.search);

        let resolver = function(successMessage) {
            // // console.log("3- consultarObtenerPartida: resolver " + JSON.stringify(successMessage));
            //de la partida obtenemos los personajes, y con ellos el que es el del jugador
            //si la partida esta publicada cerramos las consultas
            partida = successMessage.partida;
            let literalPublicaPrivada = "Publica";

            //de aqui, tomamos los jugadores.
            partida.personajes = JSON.parse(partida.personajes);
            document.getElementById("accordion").innerHTML = "";
            partida.personajes.map((pj) => {
                if (pj.id == urlParams.get('idPj')) {
                    if (pjSeleccionado == undefined) {
                        pjSeleccionado = pj;
                        insertaPJenHtml(pjSeleccionado, "jugador");
                    }
                } else { insertaPJenHtml(pj, 'accordion'); }
            });

            if (!partida.publica) {
                literalPublicaPrivada = "Privada";
                // // console.log("Limpiando interval para recuperarPartidaConID " + idIntervalconsultarPartidasPublicadasPeticion);
                // window.clearInterval(idIntervalconsultarPartidasPublicadasPeticion);
                // a partir de ahora es cuando hay que lanzar la consulta de si hay peticiones de checks
                // consultarResultadoPublicadoBucle();
                bucleConsultasJugador();
            } else {
                window.setTimeout(() => {
                    recuperarPartidaConParams();
                }, CINCO_SEGUNDOS);
            }
            document.getElementById('logoJuego').innerHTML = `<img class="w-75" src="../imagenes/rolinapp/logo${partida.juego}horizontal.png" />`;
            document.getElementById('fechaCreacion').innerText = partida.fechaCreacion;
            document.getElementById('fechaGuardado').innerText = partida.ultimaPartida;
            document.getElementById("nombrePartida").innerText = partida.nombre;
            document.getElementById("info").innerText = literalPublicaPrivada;
            document.getElementById("mostrarCuerpo").style.display = "block";
            document.getElementById("cargando").style.display = "none";
        };

        let notOK = function() {
            window.setTimeout(() => {
                recuperarPartidaConParams();
            }, CINCO_SEGUNDOS);
        };

        consultar("SERVER-partida&consultarObtenerPartida=" + urlParams.get('idPartida'), resolver, notOK);
    }
}

function aceptarDuelo() {
    console.log("aceptarDuelo");
    let opciones = document.getElementsByName("flexRadioDuelo");
    let opcion;
    for (let item of opciones) {
        if (item.checked) opcion = item.id;
    }
    let mods = "";
    // let mods = [];
    for (let item of document.getElementsByName("opcionDuelo")) {
        if (item.checked) mods += item.id + ","; //mods.push(item.id);
    }
    let respuesta = {
        opcion: opcion,
        mods: mods //JSON.stringify(mods)
    };
    // enviamos las opciones al servidor. probamos con aceptarCheck
    const respuestaDuelo = {
        ID_JUGADOR: pjSeleccionado.id,
        ID_PARTIDA: partida.id,
        RESPUESTA: respuesta
    };

    solicitar("SERVER-partida&aceptarCheck", resolver, notOK, respuestaDuelo);

}


/** Jugador */


function respuestaCheckSolicitado(successMessage) {
    console.log("respuestaCheckSolicitado ", successMessage);
    if (successMessage.SOLICITUD == "DUELO") {

        // console.log("popUpDueloAceptado para", personaje.nombre);
        document.getElementById("pjDuelista").innerText = pjSeleccionado.nombre;
        document.getElementById("pjDuelo").innerText = pjSeleccionado.id;

        let rootCE = document.getElementById("cePlaceHolderDuelo");
        rootCE.innerHTML = "";
        let rootEquipo = document.getElementById("equipoPlaceHolderDuelo");
        rootEquipo.innerHTML = "";
        let elementoOpcion = (element, root) => {
            let html = `<input type="checkbox" id="${element.id}" checked name="opcionDuelo" >${element.nombre}`;
            let row = document.createElement('div');
            row.class = "row";
            row.innerHTML = html;
            root.insertAdjacentElement("beforeend", row);
        };
        pjSeleccionado.movimientos.forEach((mov) => {
            let findMov = movimientos.find(pnjsMov => pnjsMov.id == mov);
            if (findMov != undefined && findMov.palo.includes('picas')) {
                elementoOpcion(findMov, rootCE);
            }

        });
        pjSeleccionado.equipo.forEach((equipoPnj) => {
            let piezaEquipo = equipo.find((eq) => eq.id == equipoPnj);
            if (piezaEquipo.palo == 'picas') {
                elementoOpcion(piezaEquipo, rootEquipo);
            }
        });

        $('#solicitudDueloModal').modal('show');
    } else {

        //Object { ID: 63, ID_PARTIDA: 1689847688434, ID_JUGADOR: 1681747011095, SOLICITUD: {…}, RESPUESTA: null, ESTADO: "CHECK", FECHA: "2023-07-19T22:00:00.000Z", CONTADOR: 1 }
        let solicitud = JSON.parse(successMessage.SOLICITUD);
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

        document.getElementById("difCheckSel").innerText = descripcion_dificultad[solicitud.difSel];
        // capacidades especiales
        let bloqueCE = document.getElementById("ceAplicables");
        bloqueCE.style.display = "none";
        let movs = [];
        pjSeleccionado.movimientos.map((pjMov) => { movs.push(movimientos.find(m => m.id == pjMov)) });
        let ceAdded = addHtmlElementDeColeccionFiltrandoPorPalo(movs, solicitud.habSel, 'cePlaceHolder');
        if (ceAdded > 0) {
            bloqueCE.style.display = "block";
        }
        // equipo
        let bloqueEquipo = document.getElementById("equipoAplicables");
        bloqueEquipo.style.display = "none";

        let equp = [];
        pjSeleccionado.equipo.map((pjMov) => equp.push(equipo.find(eq => eq.id == pjMov)));
        let equipoAñadido = addHtmlElementDeColeccionFiltrandoPorPalo(equp, solicitud.habSel, 'equipoPlaceHolder');
        if (equipoAñadido > 0) {
            bloqueEquipo.style.display = "block";
        }

        $('#solicitudCheckModal').modal('show');
        document.getElementById("check").style.display = "block";

        checkSolicitado = successMessage;

    }
}