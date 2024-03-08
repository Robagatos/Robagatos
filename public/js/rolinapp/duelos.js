/*jshint esversion: 8 */

function addDuelista(posicion) {
    let isPj = true;
    const buscarSeleccionado = (root) => {
        for (let item of root.children) {
            for (let item2 of item.children) {
                if (item2.checked) {
                    return item2.value;
                }
            }
        }
    };
    let selected = buscarSeleccionado(document.getElementById("dueloPjsList"));
    if (selected == undefined) {
        selected = buscarSeleccionado(document.getElementById("dueloPnjsList"));
        isPj = false;
    }


    if (selected != undefined) {
        let otraPosicion = 'Der';
        if (posicion == 'Der') {
            otraPosicion = 'Izq';
        }
        let yaSelected = "";
        let otroBoton = document.getElementById("duelistaBtn" + otraPosicion);
        if (otroBoton != undefined) {
            yaSelected = otroBoton.value;
        }
        if (selected == yaSelected.substring(0, yaSelected.indexOf("::"))) {
            alert("Ambos duelistas no pueden ser el mismo personaje");
        } else {
            let nombre = buscarPersonajePorId(selected).nombre;
            let typeButton = "btn-primary";
            if (posicion == 'Der')
                typeButton = "btn-success";
            document.getElementById("duelista" + posicion).innerHTML = `<button type="button" id="duelistaBtn${posicion}" class="p-1 btn ${typeButton} btn-lg" value ="${selected}::${isPj}" onclick="updateVisor('${selected}')">${nombre}</button>`;
            if (otroBoton != undefined) {
                document.getElementById("botonIniciarDuelo").style.display = "block";
            }
        }

    }

}
const duelistas = [];
const duelo = [];

function iniciarDuelo() {

    const solicitarDuelo = (personaje) => {
        let pj = personaje.split("::");
        let solicitarDueloJSON = {
            idPartida: partida.id,
            pjSel: pj[0],
            contador: contadorResultadoActual++
        };
        // si se trata de un pnj no hay que hacer solicitud, sino levantar al master la ventana de respuesta a solicitud de checks
        if (pj[1] == "true") {
            console.log("es pj");
            let resolver = function(successMessage) {
                console.log(successMessage);
                consultarChecksAceptados();
            };

            solicitar("SERVER-partida&solicitarDuelo", resolver, notOK, solicitarDueloJSON);
        } else {
            duelistas.push(pj[0]);
            popUpDueloAceptado();
        }
    };

    let duelistaIzq = document.getElementById("duelistaBtnIzq").value;
    let duelistaDer = document.getElementById("duelistaBtnDer").value;
    document.getElementById("resumenDuelo").style.display = "none";
    solicitarDuelo(duelistaIzq);
    solicitarDuelo(duelistaDer);

}

function popUpDueloAceptado() {
    if (duelistas.length == 1) {
        let personaje = buscarPersonajePorId(duelistas[0]);
        // console.log("popUpDueloAceptado para", personaje.nombre);
        document.getElementById("pjDuelista").innerText = personaje.nombre;
        document.getElementById("pjDuelo").innerText = personaje.id;

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
        personaje.movimientos.forEach((mov) => {
            let findMov = movimientos.find(pnjsMov => pnjsMov.id == mov);
            if (findMov != undefined && findMov.palo.includes('picas')) {
                elementoOpcion(findMov, rootCE);
            }

        });
        personaje.equipo.forEach((equipoPnj) => {
            let piezaEquipo = equipo.find((eq) => eq.id == equipoPnj);
            if (piezaEquipo.palo == 'picas') {
                elementoOpcion(piezaEquipo, rootEquipo);
            }
        });

        $('#solicitudDueloModal').modal('show');
    }

}

function aceptarDuelo() {
    let opciones = document.getElementsByName("flexRadioDuelo");
    let opcion;
    for (let item of opciones) {
        if (item.checked) opcion = item.id;
    }

    let mods = [];
    for (let item of document.getElementsByName("opcionDuelo")) {
        if (item.checked) mods.push(item.id);
    }

    let pj = document.getElementById("pjDuelo").innerText;
    duelo.push({
        id: pj,
        opcionSeleccionada: opcion,
        opcionesMods: mods
    });
    duelistas.shift();
    window.setTimeout(popUpDueloAceptado, 1000);
    if (duelo.length > 1) {
        ejecutarDuelo();
    }
}

async function ejecutarDuelo() {
    console.log("***** EJECUTAR DUELO ****");

    document.getElementById("resumenIniciativa").innerText = "";
    document.getElementById("resumenDisparos").innerText = "";
    let opcionesDueloIzq = duelo.shift();
    let duelistaIzq = buscarPersonajePorId(opcionesDueloIzq.id);
    let opcionesDueloDer = duelo.shift();
    let duelistaDer = buscarPersonajePorId(opcionesDueloDer.id);

    publicarDuelo(`<td>DUELO</td><td> Se inicia un Duelo entre ${duelistaIzq.nombre} y ${duelistaDer.nombre}</td>`, null);
    // console.log(duelistaIzq, duelistaDer);

    //calcular iniciativas
    const calcularIniciativa = (duelista, opcion) => {
        let d10 = tirada();
        if (opcion.opcionSeleccionada == "dispararPrimeroDuelo") {
            console.log("sumamos 5 por opcion disparar primero");
            d10 += 5;
        }
        d10 += duelista.habilidades.picas;
        let manoMasRapida = duelista.movimientos.find(mov => mov.id == "pistolero_1");
        if (manoMasRapida != undefined) {
            console.log("+5 por La mano mas rapida");
            d10 += 5;
        }
        if (typeof opcion.opcionesMods === "string") {
            let opcionesMods = opcion.opcionesMods.split(",");
            opcion.opcionesMods = opcionesMods;
        }
        opcion.opcionesMods.forEach((element) => {
            let piezaEquipo = buscarEquipo(element);
            if (piezaEquipo != undefined && piezaEquipo.tipo.includes("rapido")) {
                console.log("encontrado objeto rapido");
                d10 += 3;
            }
        });



        return d10;
    };
    let iniciativaIzq = calcularIniciativa(duelistaIzq, opcionesDueloIzq);
    let iniciativaDer = calcularIniciativa(duelistaDer, opcionesDueloDer);

    let diferencia = 0;
    let primero;
    let segundo;
    let primerDisparo = 0;
    let segundoDisparo = 0;
    const disparar = (duelista, mods) => {
        let totalAccion = Number(duelista.habilidades.picas);
        if (mods.opcionSeleccionada == "asegurarDuelo") {
            totalAccion += 1;
            console.log("sumamos 1 por opcion asegurarDuelo");
        }
        totalAccion += calcularModAccion(duelista, 'picas', mods);
        let result = 0;
        if (totalAccion < 1) {
            console.log("Total accion inferior a 1", totalAccion);
            let tiradas = [0, 0];
            tiradas[0] = accion(1);
            tiradas[1] = accion(1);
            result = resultadoAccion(ordenarMenorMayor(tiradas)[0]);
        } else {
            let valorAccion = accion(totalAccion);
            result = resultadoAccion(valorAccion);
        }


        // console.log("valorAccion", RES_ACCION_LITERAL[result]);
        efectosPostAccion(duelista, result, mods);
        return result;
    };

    if (iniciativaIzq >= iniciativaDer) {
        diferencia = iniciativaIzq - iniciativaDer;
        //izq va primero, o ambos juntos, lo determinará al final la diferencia
        primero = {
            duelista: duelistaIzq,
            opciones: opcionesDueloIzq.opcionesMods
        };
        segundo = {
            duelista: duelistaDer,
            opciones: opcionesDueloDer.opcionesMods
        };
    } else {
        //der va primero
        diferencia = iniciativaDer - iniciativaIzq;
        primero = {
            duelista: duelistaDer,
            opciones: opcionesDueloDer.opcionesMods
        };
        segundo = {
            duelista: duelistaIzq,
            opciones: opcionesDueloIzq.opcionesMods
        };
    }
    const calcularDamage = (tirador, modsTirador, objetivo, modsObjetivo) => {
        console.log("Entra en calculo de daño para", tirador.nombre, "contra", objetivo.nombre);
        let nodoEstadoSalud = "";

        let dañoCalculado = {
            totalModDaño: 0,
            dmg: "DMG0",
            herida: ""
        };

        let comprobarMod = (movEncontrado) => {
            if (movEncontrado != undefined) {
                let splitTipos = movEncontrado.tipo.split(",");
                splitTipos.map(tipo => {
                    let funcion = EFECTOS_DMG[tipo];
                    if (funcion != undefined)
                        dañoCalculado.totalModDaño += funcion(tirador, objetivo);
                });
            }
        };
        // del origen
        // actitud -- de momento no aplica, pero podria darse el caso de actitud 'violenta' por ejemplo que sume +1
        // habs
        // movs
        modsTirador.forEach((mod) => {
            let movEncontrado = buscarMovimiento(mod);
            comprobarMod(movEncontrado);
        });
        //equipo -- hay que obtener el DMG del arma que se emplee, en caso de haber uno.
        modsTirador.forEach((mod) => {
            let equipoEncontrado = buscarEquipo(mod);
            if (equipoEncontrado != undefined && equipoEncontrado.dmg != undefined) {
                dañoCalculado.dmg = equipoEncontrado.dmg;
                dañoCalculado.herida = equipoEncontrado.herida;
            }
        });

        nodoEstadoSalud = dañoCalculado.dmg;
        let totalMods = dañoCalculado.totalModDaño;
        let coberturaItem = 0;
        //usamos la cobertura como objetos o ce que den proteccion.
        modsObjetivo.forEach((element) => {
            let piezaEquipo = buscarEquipo(element);
            if (piezaEquipo != undefined && piezaEquipo.tipo.includes("proteccion1")) {
                console.log("encontrado objeto proteccion");
                coberturaItem++;
            }
            let ce = buscarMovimiento(element);
            if (ce != undefined && ce.tipo.includes("proteccion1")) {
                console.log("encontrado Capacidad Especial proteccion");
                coberturaItem++;
            }
        });

        // la cobertura es 0, pero no sabemos si hay mods por CE del objetivo o por equipo.
        // console.log("herida", herida);
        estadoSaludResultado = calcularHerida(nodoEstadoSalud, coberturaItem, totalMods);
        // console.log("estadoSaludResultado PRE " + estadoSaludResultado);
        //necesitamos comprobaciones POST calculo daño

        if (objetivo.salud < estadoSaludResultado) {
            objetivo.salud = estadoSaludResultado;
        } else if (objetivo.salud == estadoSaludResultado) {
            estadoSaludResultado++;
            objetivo.salud = estadoSaludResultado;
        }

        if (estadoSaludResultado > 4) {
            estadoSaludResultado = 4;
            objetivo.salud = estadoSaludResultado;
        }

        console.log(` ${tirador.nombre} hiere a ${objetivo.nombre} en estado ${estados_salud[estadoSaludResultado]}`);
        return estadoSaludResultado;
    };
    let mensajeDuelo = " ";
    //el primer disparo se ha de hacer.

    let heridaCausadaAlSegundo = 0;
    let heridaCausadaAlPrimero = 0;
    const procesarDisparo = (disparo, tirador, objetivo) => {
        let heridaCausada = 0;
        if (disparo > 0) {
            heridaCausada = calcularDamage(tirador.duelista, tirador.opciones, objetivo.duelista, objetivo.opciones);
            let heridaCausadaLit = "pero apenas causa un rasguño.";
            if (heridaCausada > 0) {
                heridaCausadaLit = ` y deja a ${objetivo.duelista.nombre}  ${estados_salud[heridaCausada]}.`;
            }
            mensajeDuelo += ` ${tirador.duelista.nombre} dispara! ${heridaCausadaLit}`;
        } else {
            mensajeDuelo += ` ${tirador.duelista.nombre} dispara y falla!`;
        }

        return heridaCausada;
    };
    const turnoNormal = () => {
        primerDisparo = disparar(primero.duelista, primero.opciones);
        segundoDisparo = disparar(segundo.duelista, segundo.opciones);
        //aplicamos ahora el daño al segundo tirador por si acaso no se ha aplicado aun por la diferencia de iniciativas
        heridaCausadaAlSegundo = procesarDisparo(primerDisparo, primero, segundo);
        heridaCausadaAlPrimero = procesarDisparo(segundoDisparo, segundo, primero);
    };
    //dispara el primero, si diferencia entre iniciativas es mayor de 5 y el exito es pleno, aplicamos daño antes de que el segundo dispare.
    if (diferencia >= 5) {
        primerDisparo = disparar(primero.duelista, primero.opciones);
        if (primerDisparo > 0) {
            document.getElementById("resumenIniciativa").innerText = `${primero.duelista.nombre} dispara primero!`;
            //calculamos daño y aplicamos antes de disparar.
            heridaCausadaAlSegundo = procesarDisparo(primerDisparo, primero, segundo);
            if (segundo.duelista.salud < 4) {
                segundoDisparo = disparar(segundo.duelista, segundo.opciones);
                heridaCausadaAlPrimero = procesarDisparo(segundoDisparo, segundo, primero);
            }
        } else {
            turnoNormal();
        }
    } else {
        turnoNormal();
    }
    console.log("RESUMEN");
    console.log("Iniciativas:", duelistaIzq.nombre, iniciativaIzq, duelistaDer.nombre, iniciativaDer);
    let mensaje = `${primero.duelista.nombre} va primero por ${diferencia} y obtiene un resultado de ${RES_ACCION_LITERAL[primerDisparo]}`;
    console.log(mensaje);
    mensaje = `${segundo.duelista.nombre} va despues y obtiene un resultado de ${RES_ACCION_LITERAL[segundoDisparo]}`;
    console.log(mensaje);
    mensaje = `${primero.duelista.nombre} causa una herida ${estados_salud[heridaCausadaAlSegundo]} y ${segundo.duelista.nombre} causa una herida ${estados_salud[heridaCausadaAlPrimero]}`;
    console.log(mensaje);
    mensaje = `${primero.duelista.nombre} queda con salud ${estados_salud[primero.duelista.salud]} y ${segundo.duelista.nombre} queda con salud ${estados_salud[segundo.duelista.salud]}`;
    console.log(mensaje);
    //publicar Resultado
    console.log("falta aplicar protecciones de los objetivos y posibles mods por sus cosas, informar en pantalla y publicar cambios.");


    document.getElementById("resumenDuelo").style.display = "block";
    if (diferencia < 5) {
        document.getElementById("resumenIniciativa").innerText = "Ambos tiradores disparan casi al unisono.";
    }
    document.getElementById("resumenDisparos").innerText = mensajeDuelo;
    //  `${primero.duelista.nombre} dispara y obtiene un resultado de ${RES_ACCION_LITERAL[primerDisparo]} y ${segundo.duelista.nombre} va dispara y obtiene un resultado de ${RES_ACCION_LITERAL[segundoDisparo]}.
    // ${primero.duelista.nombre} queda provoca una herida ${estados_salud[heridaCausadaAlSegundo]} y ${segundo.duelista.nombre} queda provoca una herida ${estados_salud[heridaCausadaAlPrimero]}`;

    await publicarDuelo(`<td>DUELO</td><td> ${mensajeDuelo}</td>`, null);
    await publicarDuelo(`<td>${primero.duelista.nombre}</td><td> Se encuentra ${estados_salud[primero.duelista.salud]}</td>`, primero.duelista);
    await publicarDuelo(`<td>${segundo.duelista.nombre}</td><td> Se encuentra ${estados_salud[segundo.duelista.salud]}</td>`, segundo.duelista);
}

async function publicarDuelo(mensaje, personaje) {
    let solicitudPublicarChecks = {
        ESTATUS: "HISTORICO",
        ID_PARTIDA: partida.id,
        RESPUESTA: mensaje,
        CONTADOR: contadorResultadoActual++
    };
    if (personaje != null) {
        solicitudPublicarChecks.ID_JUGADOR = personaje.id;
        solicitudPublicarChecks.SOLICITUD = personaje;
    } else {
        solicitudPublicarChecks.ID_JUGADOR = 0;
        solicitudPublicarChecks.SOLICITUD = "";
    }


    let resolver = function(successMessage) {
        if (successMessage.code == "OK")
            historificarResultado(solicitudPublicarChecks);
    };

    await solicitar("SERVER-partida&publicarResultado", resolver, notOK, solicitudPublicarChecks);
}

function buscarPersonajePorId(id) {
    let personaje = partida.pnjsEscena.find(p => p.id == id);
    if (personaje == undefined) {
        personaje = partida.personajes.find(p => p.id == id);
    }
    return personaje;
}