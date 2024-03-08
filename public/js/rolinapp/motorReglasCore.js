/*jshint esversion: 6 */
// motor comun del juego

const FALLO = 0;
const PARCIAL = 1;
const EXITO = 2;
const RES_ACCION_LITERAL = ["fallo", "parcial", "exito"];
let PNJS_DATA;


function buscarMovimiento(matchElement) {
    return buscarElementoEnColeccion(movimientos, matchElement);
}

function buscarEquipo(matchElement) {
    return buscarElementoEnColeccion(equipo, matchElement);
}

function buscarElementoEnColeccion(coleccion, matchElement) {
    return Object.values(coleccion).filter(elemento => elemento.id == matchElement)[0];
}

let resolver = function(successMessage) {
    console.log("3-: resolver " + JSON.stringify(successMessage));
};

function coberturaPorDefecto() {
    let cobertura = document.getElementsByName("cobertura");
    let coberturaItemChecked = false;
    for (let item of cobertura) {
        if (item.checked) {
            coberturaItemChecked = true;
            break;
        }
    }
    if (!coberturaItemChecked) {
        document.getElementById("sinCobertura").checked = true;
    }
}

function selectOptionHab(root, passedValue) {
    for (let item of root) {
        item.selected = false;
        if (item.value == passedValue) {
            item.selected = true;
        }
    }
}

function ordenarMayorMenor(valores) {
    valores.sort((a, b) => {
        if (a == b) {
            return 0;
        }
        if (a > b) {
            return -1;
        }
        return 1;
    });
    return valores;
}

function ordenarMenorMayor(valores) {
    valores.sort((a, b) => {
        if (a == b) {
            return 0;
        }
        if (a < b) {
            return -1;
        }
        return 1;
    });
    return valores;
}
//tirada de dado de 10 caras
function tirada() {
    return Math.floor((Math.random() * (10)) + 1);
}

function accion(valor, deMayorAMenor) {
    let tiradas = [];
    for (let i = 0; i < valor; i++) {
        tiradas[i] = tirada();
    }
    if (deMayorAMenor)
        tiradas = ordenarMayorMenor(tiradas);
    else
        tiradas = ordenarMenorMayor(tiradas);
    document.getElementById("habCheckTiradas").innerText = "Los resultados de las tiradas han sido: " + tiradas;
    LOG_ARRAY_INFO.push("Resultado del checkeo: " + tiradas);
    return tiradas[0];
}

//metodo de resolucion de acciones: hay que comprobar CE y Equipo antes y despues de check.
function resolverAccion(personaje, propuestaCheckJugador) {
    // console.log(personaje);
    let solicitud = propuestaCheckJugador.SOLICITUD;
    if (typeof propuestaCheckJugador.SOLICITUD == 'string') {
        solicitud = JSON.parse(propuestaCheckJugador.SOLICITUD);
    }

    let habilidad = Number(personaje.habilidades[solicitud.habSel]);
    let dificultad = solicitud.difSel;
    let mods = propuestaCheckJugador.RESPUESTA;
    if (typeof propuestaCheckJugador.RESPUESTA == 'string') {
        mods = JSON.parse(propuestaCheckJugador.RESPUESTA);
    }

    LOG_ARRAY_INFO.push(" habilidad " + habilidad + ", dificultad " + dificultad + ", mods " + mods);

    // Dificultad
    let dif = 0;
    if (dificultad == "muyFacil") {
        dif = 2;
    } else if (dificultad == "facil") {
        dif = 1;
    } else if (dificultad == "dificil") {
        dif = -1;
    } else if (dificultad == "muyDificil") {
        dif = -2;
    }
    LOG_ARRAY_INFO.push("Valor final de dificultad: " + dif);
    let totalAccion = habilidad + dif;
    //ahora comprobamos si la modificacion afecta directamente a el total de accion
    LOG_ARRAY_INFO.push("Total Accion PREVIO A mods tiene valor de " + totalAccion);
    //FALTA QUE LLEGUE EL OBJETIVO!
    totalAccion += calcularModAccion(personaje, solicitud.habSel, mods);
    // el total de accion tambien se puede ver afectado por parciales que aplican negativos, crear una fucnion que mira mods(esto incluye ce y equipo) y las consecuencias del pj, asi como las ambientales
    // en la pantalla del master un listado de las ambiaentales aplicadas a la escena, que se puedan borrar.
    let result = 0;
    LOG_ARRAY_INFO.push("Total Accion tiene valor de " + totalAccion);
    let deMayorAMenor = true;
    if (totalAccion < 1) {
        LOG_ARRAY_INFO.push("Se trata de una accion con menos de un dado " + totalAccion);
        totalAccion += -2;
        totalAccion *= -1;
        deMayorAMenor = false;
    }
    result = resultadoAccion(accion(totalAccion, deMayorAMenor));
    // aqui hay que poner un POST check
    //FALTA QUE LLEGUE EL OBJETIVO!
    efectosPostAccion(personaje, result, mods);

    if (mods != undefined && mods.length > 0) {
        mods.map((mod) => {
            if (mod == "cmAsegurarTiro" && result != EXITO) {
                let element = `<div class="font-italic">Recuerda de añadir una Consecuencia Extra por la Actitud <b>'Asegurar el Tiro'</b></div>`;
                addHtmlElement(element, document.getElementById("habCheckResultadoParciales"));
            } else if (mod == "cmTodoNada" && result != EXITO) {
                result = FALLO;
                let element = `<div class="font-italic">Se reduce el Parcial a Fallo por la Actitud <b>'Todo o Nada'</b></div>`;
                addHtmlElement(element, document.getElementById("habCheckResultadoParciales"));
            }
        });
    }

    return result;
}


//este es el resultado segun el valor del dado mas alto
function resultadoAccion(d10) {

    let result = FALLO;
    if (d10 > 7) {
        result = EXITO;
    } else if (d10 > 5) {
        result = PARCIAL;
    }

    LOG_ARRAY_INFO.push("resultado Accion " + RES_ACCION_LITERAL[result] + " para la tirada de: " + d10);
    return result;
}

//resultado accion
function calcularResultadoAccion() {
    document.getElementById("infoLog").innerHTML = "";
    LOG_ARRAY_INFO.splice(0, LOG_ARRAY_INFO.length);

    //"ID":125,"ID_PARTIDA":1689847688434,"ID_JUGADOR":1681747011095,"SOLICITUD":{"difSel":"media","habSel":"picas"},"RESPUESTA":["revolver"],"ESTADO":"ACEPTADO","FECHA":"2023-07-19T22:00:00.000Z","CONTADOR":1}}
    let jugador = partida.personajes.find(jugador => propuestaCheckJugador.ID_JUGADOR == jugador.id);
    if (jugador == undefined) {
        jugador = partida.pnjsEscena.find(p => p.id == propuestaCheckJugador.ID_JUGADOR);
    }

    let result = resolverAccion(jugador, propuestaCheckJugador);

    resultadoPublicar = { check: propuestaCheckJugador, gradoExito: result };
    let literal = RES_ACCION_LITERAL[result];
    document.getElementById("habCheckInfoMensaje").innerText = " Ha tenido un resultado de ";
    document.getElementById("habCheckResultado").innerText = " " + literal.toUpperCase();

    selectOptionHab(document.getElementById("forzarResultadoSelect"), result);

    if (result == PARCIAL) {
        Object.keys(parciales).map(parcialesKey => {
            let continuar = true;
            if (jugador.consecuencias != undefined) {
                jugador.consecuencias.filter(consecuenciaPoseida => {
                    if (parcialesKey == consecuenciaPoseida) {
                        console.log("El personaje ya tiene esa consecuencia ");
                        continuar = false;
                    }
                });
            }

            if (continuar) {
                let contadorVecesConsecuencia = contadorConsecuenciasEmpleadas[parcialesKey];
                let parcial = parciales[parcialesKey];
                let element = `<input class="form-check-input" type="radio" name="parciales" id="${parcialesKey}"><label class="form-check-label" for="parciales">${contadorVecesConsecuencia} - ${parcial.nombre}</label>`;
                addHtmlElement(element, document.getElementById("habCheckResultadoParciales"));
            }
        });
    }

    if (result == FALLO) {
        propuestaCheckJugador = null;
    }

    let rootElement = document.getElementById("infoLog");
    LOG_ARRAY_INFO.forEach((info) => {
        let row = document.createElement('li');
        row.innerText = info;
        rootElement.insertAdjacentElement("beforeend", row);
    });

}

/** HERIR  */
//aqui tiene que llegar el objetivo (los mods por movs del check de picas estan los mods salvados.)
// hay que crear un metodo y una opcion en la ventana del master para que aplique daño tras check de picas con EXITO.
function calcularHerida(damageLiteral, proteccionLiteral, mods) {

    let damage = Number(damageLiteral.substring(3));

    let proteccion = 0;
    if (proteccionLiteral == "ligeraCobertura") { proteccion = 1; } else if (proteccionLiteral == "pesadaCobertura") { proteccion = 2; }

    console.log("Total daño PREVIO A mods tiene valor de " + damage);
    damage += mods; // buscarElementoModificador("daño", mods);
    console.log("Total daño POST A mods tiene valor de " + damage);

    return herir(damage, proteccion);
}

function herir(damage, proteccion) {
    console.log("En herir, damage = " + damage + ", proteccion = " + proteccion);
    let totalAccion = damage - proteccion;

    if (totalAccion < 1) {
        let tiradas = [0, 0];
        tiradas[0] = tirada();
        tiradas[1] = tirada();
        totalAccion = ordenarMenorMayor(tiradas)[0];

    } else {
        totalAccion = accion(totalAccion);

    }

    return herido(totalAccion);
}

function herido(d10) {
    console.log("herido d10: " + d10);
    let herida = 1;
    if (d10 > 8) {
        herida = 3;
    } else if (d10 > 5) {
        herida = 2;
    }

    return herida;
}

function solicitudAplicarConsecuencia(btn) {
    console.log("solicitudAplicarConsecuencia");
    // console.log(partida);

    btn.disabled = true;
    setTimeout(() => {
        btn.disabled = false;
    }, CINCO_SEGUNDOS);

    let consecuenciasCheck = document.getElementsByName("consecuenciaInput");
    let pjsChecks = document.getElementById("consecueciasPjsList");
    let pnjsChecks = document.getElementById("consecueciasPnjsList");
    let consecuencia;
    let pj;

    for (let item of consecuenciasCheck) {
        if (item.checked) {
            consecuencia = item.id;
            item.checked = false;
        }
    }

    for (let item of pjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) {
                pj = item2.value;
                item2.checked = false;
            }
        }
    }
    for (let item of pnjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) {
                pj = item2.value;
                item2.checked = false;
            }
        }
    }
    //falta aplicar la consecuencia al jugador en el listado de jugadores de la partida y actualizarlo.
    aplicarConsecuencia(pj, consecuencia);

}

function aplicarConsecuencia(pjId, consecuencia) {

    let personaje = partida.personajes.find(jugador => pjId == jugador.id);
    if (personaje == undefined) {
        personaje = partida.pnjsEscena.find(p => p.id == pjId);
    }
    let continuar = true;
    personaje.consecuencias.filter(consecuenciaPoseida => {
        if (consecuencia == consecuenciaPoseida) {
            alert("El personaje ya tiene esa consecuencia ");
            continuar = false;
        }
    });
    if (continuar) {
        let suceso = aplicarConsecuenciaInmediata(consecuencia, personaje);
        // contadorConsecuenciasEmpleadas[consecuencia]++;
        // personaje.consecuencias.push(consecuencia);
        // let consecuenciaNombre = consecuencias[consecuencia].nombre;
        // let suceso = `Aplicada condicion ${consecuenciaNombre}`;
        let pjNombre = personaje.nombre;
        let mensaje = `<td>${pjNombre}</td><td>${suceso}</td>`;
        // recargarPjs();
        let solicitudAplicarConsecuenciaJSON = {
            ESTATUS: "HISTORICO",
            ID_PARTIDA: partida.id,
            ID_JUGADOR: personaje.id,
            SOLICITUD: personaje,
            RESPUESTA: mensaje,
            CONTADOR: contadorResultadoActual++
        };
        pjSeleccionado = null;
        historificarResultado(solicitudAplicarConsecuenciaJSON);
        solicitar("SERVER-partida&solicitudAplicarEfecto", resolver, notOK, solicitudAplicarConsecuenciaJSON);
        cargarConsecuenciasEnPagina();
    }
}

function solicitudAplicarCambioSalud(btn) {
    console.log("solicitudAplicarCambioSalud");

    btn.disabled = true;
    setTimeout(() => {
        btn.disabled = false;
    }, CINCO_SEGUNDOS);

    let heridaNodes = document.getElementsByName("selTipoHeridaAplicar");
    let herirSanarNodes = document.getElementsByName("herirSanar");
    let pjsChecks = document.getElementById("selPjSalud");
    let pnjsChecks = document.getElementById("selPnjSalud");
    let nodoEstadoSalud;
    let pj;
    let estadoSaludResultado = 0;
    let herida = "";

    for (let item of pjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) pj = item2.value;
        }
    }

    for (let item of heridaNodes) {
        if (item.checked) {
            herida = item.value;
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

    let jugador = partida.personajes.filter(jugador => pj == jugador.id)[0];
    if (jugador == undefined) {
        jugador = partida.pnjsEscena.find(p => p.id == pj);
    }
    for (let item of herirSanarNodes) {
        if (item.checked) {
            nodoEstadoSalud = item;
            item.checked = false;
        }
    }


    if (nodoEstadoSalud.id == "leve") { estadoSaludResultado = 1; } else if (nodoEstadoSalud.id == "grave") { estadoSaludResultado = 2; } else if (nodoEstadoSalud.id == "mortal") { estadoSaludResultado = 3; } else if (nodoEstadoSalud.id == "muerto") { estadoSaludResultado = 4; }

    if (estadoSaludResultado > 4) estadoSaludResultado = 4;
    // console.log("estadoSaludResultado POST " + estadoSaludResultado);

    let nuevoEstadoSalud = estados_salud[estadoSaludResultado];
    let suceso = `Cambio de estado de salud a ${nuevoEstadoSalud}`;
    let pjNombre = jugador.nombre;
    let mensaje = `<td>${pjNombre}</td><td>${suceso}</td>`;
    let solicitudAplicarConsecuenciaJSON = {
        ESTATUS: "HISTORICO",
        ID_PARTIDA: partida.id,
        ID_JUGADOR: jugador.id,
        SOLICITUD: jugador,
        RESPUESTA: mensaje,
        CONTADOR: contadorResultadoActual++
    };

    pjSeleccionado = null;
    jugador.salud = estadoSaludResultado;
    jugador.heridas[estadoSaludResultado] = herida;
    // hasta aqui

    historificarResultado(solicitudAplicarConsecuenciaJSON);
    solicitar("SERVER-partida&solicitudAplicarEfecto", resolver, notOK, solicitudAplicarConsecuenciaJSON);

}


function solicitudCheckCambioSalud(btn) {
    console.log("solicitudCheckCambioSalud");

    btn.disabled = true;
    setTimeout(() => {
        btn.disabled = false;
    }, CINCO_SEGUNDOS);

    let heridaNodes = document.getElementsByName("selTipoHerida");
    let herirSanarNodes = document.getElementsByName("checkHerirSanar");
    let pjsChecks = document.getElementById("selPjChecksSalud");
    let pnjsChecks = document.getElementById("selPnjChecksSalud");
    let nodoEstadoSalud;
    let objetivoID;
    let estadoSaludResultado = 0;
    let herida = 0;

    for (let item of heridaNodes) {
        if (item.checked) {
            herida = item.value;
        }
    }

    for (let item of pjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) objetivoID = item2.value;
        }
    }

    for (let item of pnjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) {
                isPnj = true;
                objetivoID = item2.value;
            }
        }
    }

    let objetivo = partida.personajes.filter(jugador => objetivoID == jugador.id)[0];
    if (objetivo == undefined) {
        objetivo = partida.pnjsEscena.find(p => p.id == objetivoID);
    }
    for (let item of herirSanarNodes) {
        if (item.checked) {
            nodoEstadoSalud = item.id;
            item.checked = false;
        }
    }

    //cobertura
    let cobertura = document.getElementsByName("cobertura");
    let coberturaItem = 0;
    for (let item of cobertura) {
        if (item.checked) {
            coberturaItem = item.id;
            item.checked = false;
        }
    }

    let totalMods = 0; // jugador.salud;
    console.log("totalMods PREVIO A mods tiene valor de " + totalMods);

    let checkLastCheck = document.getElementById("lastCheckCB").checked;
    if (checkLastCheck) {
        if (nodoEstadoSalud == undefined) nodoEstadoSalud = "";
        if (propuestaCheckJugador != null) {
            let origen = partida.personajes.filter(jugador => propuestaCheckJugador.ID_JUGADOR == jugador.id)[0];
            if (origen == undefined) {
                origen = partida.pnjsEscena.find(p => p.id == propuestaCheckJugador.ID_JUGADOR);
            }

            let dañoCalculado = calcularModDaño(origen, objetivo);
            nodoEstadoSalud = dañoCalculado.dmg;
            totalMods = dañoCalculado.totalModDaño;
            herida = dañoCalculado.herida;
        }
    }

    estadoSaludResultado = calcularHerida(nodoEstadoSalud, coberturaItem, totalMods);
    console.log("estadoSaludResultado PRE " + estadoSaludResultado);
    //necesitamos comprobaciones POST calculo daño

    if (objetivo.salud > estadoSaludResultado) {
        estadoSaludResultado = objetivo.salud;
    } else if (objetivo.salud == estadoSaludResultado) {
        estadoSaludResultado++;
    }

    if (estadoSaludResultado > 4) estadoSaludResultado = 4;
    // console.log("estadoSaludResultado POST " + estadoSaludResultado);

    let nuevoEstadoSalud = estados_salud[estadoSaludResultado];
    let suceso = `Cambio de estado de salud a ${nuevoEstadoSalud}`;
    let pjNombre = objetivo.nombre;
    let mensaje = `<td>${pjNombre}</td><td>${suceso}</td>`;
    let solicitudAplicarConsecuenciaJSON = {
        ESTATUS: "HISTORICO",
        ID_PARTIDA: partida.id,
        ID_JUGADOR: objetivo.id,
        SOLICITUD: objetivo,
        RESPUESTA: mensaje,
        CONTADOR: contadorResultadoActual++
    };

    pjSeleccionado = null;
    objetivo.salud = estadoSaludResultado;
    objetivo.heridas[estadoSaludResultado] = herida;
    // hasta aqui

    historificarResultado(solicitudAplicarConsecuenciaJSON);
    solicitar("SERVER-partida&solicitudAplicarEfecto", resolver, notOK, solicitudAplicarConsecuenciaJSON);

}

function mostrarOcultarArmaHerida(inputCheck) {
    let armaHeridaCard = document.getElementById("armaHeridaCard");
    if (inputCheck.checked) {
        armaHeridaCard.style.display = "none";
    } else {
        armaHeridaCard.style.display = "block";
    }
}
/** este metodo tiene que calcular los mods a aplicar a checks de daño segun movimientos, consecuencias y equipo
 * ademas de los parametros origen, objetivo, hay que tener en cuenta el array ENTORNO donde se guardan los efectos generales aplicados.
 * debe retornar un objeto con el totalMods y el nodoEstadoSalud.id
 */
function calcularModDaño(origen, objetivo) {
    let dañoCalculado = {
        totalModDaño: 0,
        dmg: "DMG0",
        herida: ""
    };
    let mods = JSON.parse(propuestaCheckJugador.RESPUESTA);

    let comprobarMod = (movEncontrado) => {
        if (movEncontrado != undefined) {
            let splitTipos = movEncontrado.tipo.split(",");
            splitTipos.forEach(tipo => {
                let funcion = EFECTOS_DMG[tipo];
                if (funcion != undefined)
                    dañoCalculado.totalModDaño += funcion("atacante");
            });
        }
    };
    // del origen
    // actitud -- de momento no aplica, pero podria darse el caso de actitud 'violenta' por ejemplo que sume +1
    // habs
    // movs
    mods.forEach((mod) => {
        let movEncontrado = buscarMovimiento(mod);
        comprobarMod(movEncontrado);
    });
    //equipo -- hay que obtener el DMG del arma que se emplee, en caso de haber uno.
    mods.forEach((mod) => {
        let equipoEncontrado = buscarEquipo(mod);
        if (equipoEncontrado && equipoEncontrado.dmg) {
            dañoCalculado.dmg = equipoEncontrado.dmg;
            dañoCalculado.herida = equipoEncontrado.herida;
        }
    });
    //consecuencias
    // FALTA comprobar si hay alguna consecuencia que pueda afectar al calculo del daño.
    //del objetivo
    // actitud -- de momento no aplica, pero podria darse el caso de actitud 'defensiva' o 'encajar' por ejemplo que sume +1
    // habs -- 
    // movs -- proteccion por ejemplo es un mov pasivo que da un +1 proteccion
    objetivo.movimientos.forEach((mod) => {
        let movEncontrado = buscarMovimiento(mod);
        let funcion = EFECTOS_DMG[movEncontrado.tipo];
        if (funcion != undefined)
            dañoCalculado.totalModDaño += funcion("defensor");
    });
    // if (movEncontrado.tipo.includes("proteccion")) {
    //     let proteccion = Number.parseInt(movEncontrado.tipo.replace("proteccion", ""));
    //     dañoCalculado.totalModDaño -= proteccion;
    // }
    // });
    //equipo -- algun tipo de armadura o escudo

    objetivo.equipo.forEach((equipoID) => {
        let equipoEncontrado = buscarEquipo(equipoID);
        let funcion = EFECTOS_DMG[equipoEncontrado.tipo];
        if (funcion != undefined)
            dañoCalculado.totalModDaño += funcion("defensor");
    });
    //     if (equipoEncontrado.tipo.includes("proteccion")) {
    //         let proteccion = Number.parseInt(equipoEncontrado.tipo.replace("proteccion", ""));
    //         dañoCalculado.totalModDaño -= proteccion;
    //     }
    // });

    //consecuencias
    return dañoCalculado;
}
/** este metodo tiene que calcular los mods a aplicar a checks de daño segun movimientos, consecuencias y equipo.
ademas de los parametros origen, objetivo (pero el objetivo no lo tengo en una solicitud de check),
hay que tener en cuenta el array ENTORNO donde se guardan los efectos generales aplicados*/

const EFECTOS_DMG = {
    //"azote":"+1 daño vs miasma o manchado o macula, como se decida nombrar",
    "daño": (atacanteDefensor) => { if (atacanteDefensor === "atacante") return 1; },
    "inmaterial": "",
    "nomuerto": "",
    "proteccion1": (atacanteDefensor) => {
        if (atacanteDefensor === "defensor") {
            return -1;
        }
    }
};

/*
origen: pj que realiza la accion
objetivo: pj objetivo de la accion.
*/
function calcularModDMG(origen, objetivo) {
    // let result = 0;
    // // las consecuencias que puedan modificar el check, siempre retornan un valor a sumar o restar
    // origen.consecuencias.filter(consecuenciaKey => {
    //     console.log("revisar consecuencia " + consecuenciaKey);
    //     if (CONSECUENCIAS_APLICADAS_ACCION[consecuenciaKey] != undefined) {
    //         let funcion = CONSECUENCIAS_APLICADAS_ACCION[consecuenciaKey];
    //         result += funcion(origen, tipoCheck);
    //     }
    // });

    // result += buscarElementoModificador("+1", mods);

    // return result;
}
//------------------------------------------
function quitarCondicion(condicion, personajeId) {

    pjSeleccionado = null;
    let personaje = partida.personajes.filter(jugador => jugador.id == personajeId)[0];
    if (personaje == undefined) {
        personaje = partida.pnjsEscena.find(p => p.id == personajeId);
    }
    personaje.consecuencias = personaje.consecuencias.filter((consecuencia) => consecuencia != condicion);
    // tenemos que enviar el pj en lugar de lo que hay que hacer en los casos en que modificamos el pj

    let consecuenciaNombre = consecuencias[condicion].nombre;
    let suceso = `Eliminada condicion ${consecuenciaNombre}`;
    let pjNombre = personaje.nombre;
    let mensaje = `<td>${pjNombre}</td><td>${suceso}</td>`;

    let solicitudAplicarConsecuenciaJSON = {
        ESTATUS: "HISTORICO",
        ID_PARTIDA: partida.id,
        ID_JUGADOR: personaje.id,
        SOLICITUD: personaje,
        RESPUESTA: mensaje,
        CONTADOR: contadorResultadoActual++
    };
    historificarResultado(solicitudAplicarConsecuenciaJSON);
    solicitar("SERVER-partida&solicitudAplicarEfecto", resolver, notOK, solicitudAplicarConsecuenciaJSON);
}

//** EQUIPO */
//para cargar el equipo custom
function cargarEquipo() {
    partida.equipoCustom.map(piezaCustom => equipo.push(piezaCustom));
}

function cargarPJsSelectorPjsEquipo() {
    if (partida != null && partida.personajes != null) {
        partida.personajes.filter(jugador => {
            addOptionElement(jugador.id, jugador.nombre, jugador.custom, 'selectPj');
        });
    }

}

function recargarElementosSelectorPorPJ() {
    // console.log("recargar el equipo para pj ");
    let root = document.getElementById('selectPj');
    let personajeId;
    for (let item of root.children) { if (item.selected) { personajeId = item.value; } };
    console.log(personajeId);

    if (personajeId != "default") {
        let personaje = partida.personajes.filter(jugador => jugador.id == personajeId)[0];
        // selectDarEquipo
        document.getElementById('selectDarEquipo').innerHTML = "";

        equipo.forEach((element) => {
            let piezaNueva = true;
            personaje.equipo.forEach((pjElementId) => {
                if (element.id == pjElementId) {
                    piezaNueva = false;
                }
            });
            if (piezaNueva) {
                addOptionElement(element.id, element.nombre, element.custom, 'selectDarEquipo');
            }
        });

        // selectRetirarEquipo
        document.getElementById('selectRetirarEquipo').innerHTML = "";
        personaje.equipo.forEach((pieza) => {
            let piezaRetirar = equipo.find((value, index, obj) => {
                if (value.id == pieza) return value;
            });
            addOptionElement(pieza, piezaRetirar.nombre, piezaRetirar.custom, 'selectRetirarEquipo');
        });
    }
}

function addOptionElement(id, innerText, custom, rootElement) {
    let root = document.getElementById(rootElement);
    let option = document.createElement('option');
    option.value = id;
    option.innerText = innerText;
    if (custom) {
        option.class = "bg-secondary";
    }
    root.insertAdjacentElement("beforeend", option);
}

function solicitudCrearEquipo() {
    console.log("Crear Equipo");
    let nombreNuevaPieza = document.getElementById('nombreEquipoNuevo').value;
    let keyEquipo = nombreNuevaPieza.replace(/\s+/g, '') + "_custom";
    if (partida.equipoCustom[keyEquipo] == undefined) {
        document.getElementById('infoCrearEquipo').style.display = "none";
        let tipoPiezaEquipo;
        let root = document.getElementById('paloEquipo');
        for (let item of root.children) { if (item.selected) { tipoPiezaEquipo = item.value; } }
        let modPiezaEquipo;
        root = document.getElementById('modEquipo');
        for (let item of root.children) { if (item.selected) { modPiezaEquipo = item.value; } }
        let nuevaPiezaEquipo = {
            id: keyEquipo,
            nombre: nombreNuevaPieza,
            descripcion: document.getElementById('descEquipoNuevo').value,
            palo: tipoPiezaEquipo,
            tipo: modPiezaEquipo,
            custom: true
        };
        equipo.push(nuevaPiezaEquipo);
        partida.equipoCustom.push(nuevaPiezaEquipo);
    } else {
        //mensaje error infoCrearEquipo
        document.getElementById('infoCrearEquipo').style.display = "block";
    }

}

function darEquipo() {
    console.log("darEquipo");
    gestionarEquipo('selectDarEquipo', true);
}

function retirarEquipo() {
    console.log("retirarEquipo");
    gestionarEquipo('selectRetirarEquipo', false);
}

function gestionarEquipo(rootSelectElement, darEquipoFlag) {
    console.log("gestionarEquipo");
    let root = document.getElementById('selectPj');
    let personajeId;
    for (let item of root.children) { if (item.selected) { personajeId = item.value; } };


    if (personajeId != "default") {
        let piezaEquipo;
        let root = document.getElementById(rootSelectElement);
        for (let item of root.children) { if (item.selected) { piezaEquipo = item.value; } }
        if (piezaEquipo != undefined) {
            let tipoGestion = "Ha ganado";
            let personaje = partida.personajes.filter(jugador => jugador.id == personajeId)[0];
            if (darEquipoFlag) {
                personaje.equipo.push(piezaEquipo);
            } else {
                tipoGestion = "Ha perdido";
                console.log(piezaEquipo);
                console.log(personaje.equipo);
                personaje.equipo = Object.values(personaje.equipo).filter((pieza) => pieza != piezaEquipo);

            }

            let equipoNombre = equipo.find((equ) => equ.id == piezaEquipo).nombre;
            let suceso = `${tipoGestion}: ${equipoNombre}`;
            let pjNombre = personaje.nombre;
            let mensaje = `<td>${pjNombre}</td><td>${suceso}</td>`;

            let solicitudCambiarEquipoJSON = {
                ESTATUS: "HISTORICO",
                ID_PARTIDA: partida.id,
                ID_JUGADOR: personaje.id,
                SOLICITUD: personaje,
                RESPUESTA: mensaje,
                CONTADOR: contadorResultadoActual++
            };

            historificarResultado(solicitudCambiarEquipoJSON);
            solicitar("SERVER-partida&solicitudAplicarEfecto", resolver, notOK, solicitudCambiarEquipoJSON);
            recargarElementosSelectorPorPJ();
        }
    }

}

/**FUNCIONES CONSECUENCIAS */
const CONSECUENCIAS_INMEDIATAS = {
    "id_1": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_1'].nombre}</b>`; },
    "id_2": (personaje) => {
        if (personaje.salud < 2) {
            personaje.salud++;
            return `Y dolió!</b>`;
        } else {
            alert("no podemos aplicar la consecuencia al personaje y le aplicamos " + consecuencias['id_5'].nombre);
            personaje.consecuencias.push('id_5');
            return `Se aplica la consecuencia: <b>${consecuencias['id_5'].nombre}</b>`;
        }
    },
    "id_3": () => { return `Se aplica la consecuencia: <b>${consecuencias['id_3'].nombre}</b>`; },
    "id_4": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_4'].nombre}</b>`; },
    "id_6": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_6'].nombre}</b>`; },
    "id_7": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_7'].nombre}</b>`; },
    "id_8": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_8'].nombre}</b>`; },
    "id_11": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_11'].nombre}</b>`; },
    "id_12": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_12'].nombre}</b>`; },
    "id_14": (personaje) => { return `Se aplica la consecuencia: <b>${consecuencias['id_14'].nombre}</b>`; }

};

function aplicarConsecuenciaInmediata(consecuenciaKey, personaje) {
    contadorConsecuenciasEmpleadas[consecuenciaKey]++;
    let funcion = CONSECUENCIAS_INMEDIATAS[consecuenciaKey];
    if (funcion != undefined) {
        return funcion(personaje);
    } else {
        personaje.consecuencias.push(consecuenciaKey);
        return `Se aplica la consecuencia: <b>${consecuencias[consecuenciaKey].nombre}</b>`;
    }
}

/** este metodo tiene que calcular los mods a aplicar a checks de accion segun movimientos, consecuencias y equipo.
ademas de los parametros origen, objetivo (pero el objetivo no lo tengo en una solicitud de check),
hay que tener en cuenta el array ENTORNO donde se guardan los efectos generales aplicados*/

const EFECTOS_APLICADOS_ACCION = {

    "+1": (origen, tipoCheck) => { return 1; },
    "-1": (origen, tipoCheck) => { return -1; },
    "id_5": (origen, tipoCheck) => { return -1; },
    "id_9": (origen, tipoCheck) => {
        if (tipoCheck == "picas" || tipoCheck == "treboles") return -1;
        else return 0;
    },
    "id_10": (origen, tipoCheck) => {
        if (tipoCheck == "corazones" || tipoCheck == "diamantes") return -1;
        else return 0;
    },
    "id_16": (origen, tipoCheck) => {
        origen.consecuencias = origen.consecuencias.filter((consecuencia) => consecuencia != "id_16");
        return 1;
    },
    "id_17": (origen, tipoCheck) => {
        origen.consecuencias = origen.consecuencias.filter((consecuencia) => consecuencia != "id_17");
        return -1;
    }
};

/*
origen: pj que realiza la accion
tipoCheck: palo del check
mods: array de mods seleccionados
objetivo: pj objetivo de la accion.
*/
function calcularModAccion(origen, tipoCheck, mods) {
    let result = 0;
    //las heridas disminuyen el exito
    result -= origen.salud;
    // las consecuencias que puedan modificar el check, siempre retornan un valor a sumar o restar
    origen.consecuencias.filter(consecuenciaKey => {
        console.log("revisar consecuencia " + consecuenciaKey);
        if (EFECTOS_APLICADOS_ACCION[consecuenciaKey] != undefined) {
            let funcion = EFECTOS_APLICADOS_ACCION[consecuenciaKey];
            result += funcion(origen, tipoCheck);
        }
    });

    mods.forEach((mod) => {
        // console.log(mod);
        let aplicarEfecto = (movEncontrado) => {
            if (movEncontrado != undefined) {
                let splitTipos = movEncontrado.tipo.split(",");
                splitTipos.forEach(tipo => {
                    let funcion = EFECTOS_APLICADOS_ACCION[tipo];
                    if (funcion != undefined)
                        result += funcion(origen, tipoCheck);
                });
            }
        };
        let movEncontrado = buscarMovimiento(mod);
        aplicarEfecto(movEncontrado);
        movEncontrado = buscarEquipo(mod);
        aplicarEfecto(movEncontrado);
    });

    console.log("calcularModAccion", result);
    return result;
}


function efectosPostAccion(origen, resultado, mods) {
    mods.map((mod) => {
        // console.log(mod);
        let aplicarEfecto = (movEncontrado) => {
            if (movEncontrado != undefined) {
                let splitTipos = movEncontrado.tipo.split(",");
                splitTipos.map(tipo => {
                    let funcion = CE_POST_ACCION[tipo];
                    if (funcion != undefined) {
                        funcion(origen, resultado);
                    }
                });

            }
        };
        let movEncontrado = buscarMovimiento(mod);
        aplicarEfecto(movEncontrado);
        movEncontrado = buscarEquipo(mod);
        aplicarEfecto(movEncontrado);
    });
}

/**
 * pasamos por los mods por id, aplicando lo que toque.
 */
const CE_POST_ACCION = {
    "sinMunicion": (origen, resultado) => {
        // aplicar consecuencia al origen
        origen.consecuencias.push("id_15");
    },
    "robarSuerte": (origen, resultado) => {
        // si ha tenido exito o parcial, aplicar consecuencia de "Suerte" a origen y "Gafado" al objetivo (esto ultimo debe ser a mano por el master)
        if (resultado > 0) {
            origen.consecuencias.push("id_16");
            //se puede levantar una ventana que muestre los objetivos posibles para el efecto "Gafado" o "Maldito"
        }
    },
    "asManga": (origen, resultado) => {
        // si no es exito, aplicar consecuencia extra
        if (resultado < 2) {
            alert("hay que aplicar una consecuencia extra");
        }
    },
    "dadosCargados": (origen, resultado) => {
        // convertir parcial a fallo y con consecuencia extra
        if (resultado < 2) {
            if (resultado == 1) resultado = 0;
            alert("hay que aplicar una consecuencia extra");
        }
    },
    "recargaLenta": (origen, resultado) => {
        // aplicar consecuencia al origen
        origen.consecuencias.push("id_18");
    }
};

/**cargar pnjs */
function cargarPnjs() {

    let fn = (jsonObj) => {
        let root = document.getElementById("listPnjsDisponibles");
        PNJS_DATA = jsonObj;
        PNJS_DATA.pnjs.map((pnj) => {
            let color = "";
            if (pnj.custom) {
                color = "bg-info";
            }
            if (pnj.manchado) {
                color = "bg-secondary text-light";
            }
            let element = `<button type="button" class="list-group-item list-group-item-action ${color}" id="${pnj.id}" onclick="selPnjAdd(this)">${pnj.nombre}</button>`;
            addHtmlElement(element, root);

        });

        movimientos.map(mov => {
            addOptionElement(mov.id, mov.nombre, mov.custom, 'selectCEPnjs');
        });

        Object.values(equipo).map(equipoPieza => {
            addOptionElement(equipoPieza.id, equipoPieza.nombre, equipoPieza.custom, 'selectEquipoPnjs');
        });

        if (partida != undefined) {
            partida.pnjs.map(pnj => {
                let element = `<button type="button" class="list-group-item list-group-item-action bg-info" id="${pnj.id}" onclick="selPnjAdd(this)">${pnj.nombre}</button>`;
                addHtmlElement(element, root);
                PNJS_DATA.pnjs.push(pnj);
            });
            root = document.getElementById("listPnjsActuales");
            partida.pnjsEscena.map(pnj => {
                let color = "";
                if (pnj.custom) {
                    color = "bg-info";
                }
                if (pnj.manchado) {
                    color = "bg-secondary text-light";
                }
                let element = `<button type="button" class="list-group-item list-group-item-action ${color}" id="${pnj.id}" onclick="selPnjRemove(this)">${pnj.nombre}</button>`;
                addHtmlElement(element, root);
            });
        }
    };
    if (equipo != undefined)
        cargarJson('pnjs.json', fn);
    else setTimeout(() => {
        cargarPnjs();
    }, CINCO_SEGUNDOS);
}

function describirPnj(pnj) {
    document.getElementById("nombrePnj").value = pnj.nombre;
    document.getElementById("notasPnj").value = pnj.descripcion;

    selectOptionHab(document.getElementById("puntosPicas"), pnj.habilidades.picas);
    selectOptionHab(document.getElementById("puntosCorazones"), pnj.habilidades.corazones);
    selectOptionHab(document.getElementById("puntosTreboles"), pnj.habilidades.treboles);
    selectOptionHab(document.getElementById("puntosDiamantes"), pnj.habilidades.diamantes);

    estadoSaludHtml("saludPnj", pnj.salud, pnj.heridas);

    let root = document.getElementById("pnjEquipoList");

    root.innerHTML = "";
    pnj.equipo.map(equipoSelect => {
        let row = document.createElement('li');
        row.id = equipoSelect;
        row.innerText = equipo.find((equ) => equ.id == equipoSelect).nombre;
        row.style.width = "100%";
        root.insertAdjacentElement("beforeend", row);
    });

    root = document.getElementById("pnjCEList");

    root.innerHTML = "";
    pnj.movimientos.map(ce => {
        let row = document.createElement('li');
        row.id = ce;
        row.style.width = "100%";
        row.innerText = movimientos.find(mov => mov.id == ce).nombre;
        root.insertAdjacentElement("beforeend", row);
    });

}

function estadoSaludHtml(element, salud, heridas) {
    let colorbg = "bg-success text-white";
    let categoriaHerida = literales_heridas[heridas[salud]];
    if (categoriaHerida == undefined) {
        categoriaHerida = "";
    }
    let estadoSalud = estados_salud[salud];
    let infoHeridasImportante = "";
    //comprobamos si tiene una herida letal o escabrosa en categoria inferior a la actual si esta es contundente
    if (heridas[salud] == 0) {
        for (let i = 0; i < salud; i++) {
            if (heridas[i] > heridas[salud]) {
                infoHeridasImportante = "Atencion, el personaje tiene heridas importantes en <b>" + estados_salud[i] + "</b> categoria <b>" + literales_heridas[heridas[i]] + "</b>";
            }
        }
    }
    switch (salud) {
        case 0:
            categoriaHerida = "";
            break;
        case 1:
            colorbg = "bg-secondary text-white";
            break;
        case 2:
            colorbg = "bg-warning text-dark";
            break;
        case 3:
            colorbg = "bg-danger text-white";
            break;
        case 4:
            if (heridas[salud] == 0) {
                estadoSalud = "Inconsciente";
                categoriaHerida = "";
            }
            colorbg = "text-white bg-dark";
            break;
    }

    let html = `<span class="${colorbg}" >${estadoSalud}</span><span> ${categoriaHerida} </span> <div><i>${infoHeridasImportante}</i></div>`;
    document.getElementById(element).innerHTML = html;
}

function selPnjAdd(btn) {
    let pnj = partida.pnjsEscena.find(findpnj => { if (findpnj.id == btn.id) return findpnj; });
    if (pnj == undefined) {
        pnj = PNJS_DATA.pnjs.find(findpnj => { if (findpnj.id == btn.id) return findpnj; });
    }
    if (pnj == undefined) {
        pnj = partida.pnjs.find(findpnj => { if (findpnj.id == btn.id) return findpnj; });
    }
    document.getElementById("pnjSelAdd").innerText = btn.id;
    describirPnj(pnj);
    updateVisor(pnj);
    if (pnj.custom) {
        document.getElementById("borrarPnjCustom").style.display = "block";
    } else {
        document.getElementById("borrarPnjCustom").style.display = "none";
    }

}

function borrarPnjCustom() {
    let pnjSel = document.getElementById("pnjSelAdd").innerText;


    let root = document.getElementById("listPnjsDisponibles");
    for (let item of root.childNodes) {
        for (let item2 of item.childNodes) {
            if (item2.id == pnjSel) {
                root.removeChild(item);
            }
        }
    }
    //eliminemos el pnj del listado de pnjs en la partida.
    partida.pnjs = partida.pnjs.filter(pnj => pnj.id != pnjSel);
    salvarPartida();
    document.getElementById("borrarPnjCustom").style.display = "none";
}

function selPnjRemove(btn) {
    let pnj = partida.pnjsEscena.find(pnj => pnj.id == btn.id);
    if (pnj == undefined) {
        pnj = PNJS_DATA.pnjs.find(pnj => pnj.id == btn.id);
    } else if (pnj == undefined) {
        pnj = partida.pnjs.find(pnj => pnj.id == btn.id);
    }
    document.getElementById("pnjSelRemove").innerText = btn.id;
    describirPnj(pnj);
    updateVisor(pnj);
}

function crearPnj() {

    let pnj = {
        id: "",
        nombre: "",
        descripcion: "",
        idJugador: "pnj",
        habilidades: {
            picas: 0,
            treboles: 0,
            corazones: 0,
            diamantes: 0
        },
        movimientos: [],
        equipo: [],
        salud: 0,
        heridas: [],
        consecuencias: [],
        custom: true
    };

    pnj.nombre = document.getElementById("nombrePnj").value;
    pnj.descripcion = document.getElementById("notasPnj").value;
    pnj.habilidades.picas = getSelectValue(document.getElementById("puntosPicas"));
    pnj.habilidades.corazones = getSelectValue(document.getElementById("puntosCorazones"));
    pnj.habilidades.treboles = getSelectValue(document.getElementById("puntosTreboles"));
    pnj.habilidades.diamantes = getSelectValue(document.getElementById("puntosDiamantes"));
    let contadorPnjs = PNJS_DATA.pnjs.length;
    pnj.id = pnj.nombre + "_" + contadorPnjs;
    //falta el equipo, las capacidades especiales (movimientos) y las consecuencias.
    for (let item of document.getElementById("pnjEquipoList").children) {
        pnj.equipo.push(item.id);
    }
    for (let item of document.getElementById("pnjCEList").children) {
        pnj.movimientos.push(item.id);
    }

    PNJS_DATA.pnjs.push(pnj);
    partida.pnjs.push(pnj);
    let root = document.getElementById("listPnjsDisponibles");
    let element = `<button type="button" class="list-group-item list-group-item-action bg-info" id="${pnj.nombre+"_"+contadorPnjs}" onclick="selPnjAdd(this)">${pnj.nombre}</button>`;
    addHtmlElement(element, root);
    salvarPartida();
}

function addPnjListado() {
    let pnjSel = document.getElementById("pnjSelAdd").innerText;

    if (pnjSel == undefined || pnjSel.length == 0) {
        document.getElementById("infoPnj").innerText = `Selecciona un PNJ de la columna Pnjs Disponibles`;
    } else {
        let pnj = Object.assign({}, PNJS_DATA.pnjs.find(pnj => pnj.id == pnjSel));
        pnj.id = pnj.id + "_" + partida.pnjsEscena.length;
        console.log(PNJS_DATA.pnjs.find(pnj => pnj.id == pnjSel));
        console.log("EL nuevo");
        console.log(pnj);
        let color = "";
        if (pnj.custom) {
            color = "bg-info";
        }
        if (pnj.manchado) {
            color = "bg-secondary text-light";
        }
        let root = document.getElementById("listPnjsActuales");
        let element = `<button type="button" class="list-group-item list-group-item-action ${color}" id="${pnj.id}" onclick="selPnjRemove(this)">${pnj.nombre}</button>`;

        addHtmlElement(element, root);
        partida.pnjsEscena.push(pnj);
        salvarPartida();
        actulizarListadoPnjsObjetivo();
        document.getElementById("pnjSelAdd").innerText = "";
    }
}

function eliminarPnjListado() {

    let pnjSel = document.getElementById("pnjSelRemove").innerText;

    if (pnjSel == undefined || pnjSel.length == 0) {
        document.getElementById("infoPnj").innerText = `Selecciona un PNJ de la columna Pnjs Actuales`;
    } else {
        let root = document.getElementById("listPnjsActuales");
        for (let item of root.childNodes) {
            for (let item2 of item.childNodes) {
                if (item2.id == pnjSel) {
                    root.removeChild(item);
                }
            }
        }
        //eliminemos el pnj del listado de pnjs en la partida.
        partida.pnjsEscena = partida.pnjsEscena.filter(pnj => pnj.id != pnjSel);
        salvarPartida();
        actulizarListadoPnjsObjetivo();
        document.getElementById("pnjSelAdd").innerText = "";
    }

}

function darEquipoPnj() {
    let equipoSelect = getSelectValue(document.getElementById("selectEquipoPnjs"));
    let root = document.getElementById("pnjEquipoList");
    let continuar = true;
    for (let item of root.childNodes) {
        if (item.id != null && item.id == equipoSelect) {
            continuar = false;
        }
    }
    if (continuar) {
        let row = document.createElement('li');
        row.id = equipoSelect;
        row.style.width = "100%";
        row.innerText = equipo.find((equ) => equ.id == equipoSelect).nombre;
        root.insertAdjacentElement("beforeend", row);
    }
}

function darCEPnj() {
    let ce = getSelectValue(document.getElementById("selectCEPnjs"));
    let root = document.getElementById("pnjCEList");
    let continuar = true;
    for (let item of root.childNodes) {
        if (item.id != null && item.id == ce) {
            continuar = false;
        }
    }
    if (continuar) {
        let row = document.createElement('li');
        row.id = ce;
        row.style.width = "100%";
        row.innerText = movimientos.find(mov => mov.id == ce).nombre;
        root.insertAdjacentElement("beforeend", row);
    }
}

/** */
function updateVisor(pnjId) {
    let pnj;
    if (pnjId.id == undefined) {
        pnj = partida.pnjsEscena.find(pnj => pnj.id == pnjId);
    } else {
        pnj = pnjId;
    }
    if (pnj != undefined) {
        document.getElementById("nombreLabelPnjVisor").innerText = pnj.nombre;
        estadoSaludHtml("saludPnjVisor", pnj.salud, pnj.heridas);
        let manchado = "";
        let classManchado = "bg-white";
        if (pnj.manchado) {
            manchado = "Sucio";
            classManchado = "bg-secondary";
        }
        if (pnj.idJugador != 'pnj') {
            classManchado = "bg-warning";
        }
        document.getElementById("visor").className = classManchado;
        document.getElementById("manchadoFlagPnjVisor").innerText = manchado;

        puntuarHab(pnj.habilidades.picas, "picas", document.getElementById("picasVisor"));
        puntuarHab(pnj.habilidades.corazones, "corazones", document.getElementById("corazonesVisor"));
        puntuarHab(pnj.habilidades.treboles, "treboles", document.getElementById("trebolesVisor"));
        puntuarHab(pnj.habilidades.diamantes, "diamantes", document.getElementById("diamantesVisor"));

        root = document.getElementById('pnjConsecuenciasListVisor');

        root.innerHTML = "";
        pnj.consecuencias.map(ce => {
            let row = document.createElement('li');
            row.id = ce;
            row.style.width = "100%";
            row.innerHTML = `<button type="button" class="btn btn-danger btn-sm" onclick="quitarCondicion('${ce}', '${pnj.id}')">X</button><span> ${consecuencias[ce].nombre}</span>`;
            // row.innerText = consecuencias[ce].nombre;
            root.insertAdjacentElement("beforeend", row);
        });



        root = document.getElementById("pnjEquipoListVisor");

        root.innerHTML = "";
        pnj.equipo.map(equipoSelect => {
            let row = document.createElement('li');
            row.id = equipoSelect;
            row.innerText = equipo.find((equ) => equ.id == equipoSelect).nombre;
            row.style.width = "100%";
            root.insertAdjacentElement("beforeend", row);
        });

        root = document.getElementById("pnjCEListVisor");

        root.innerHTML = "";
        pnj.movimientos.map(ce => {
            let row = document.createElement('li');
            row.id = ce;
            row.style.width = "100%";
            row.innerText = movimientos.find(mov => mov.id == ce).nombre;
            root.insertAdjacentElement("beforeend", row);
        });
        // } else {
        //     document.getElementById("nombreLabelPnjVisor").innerText = "";
        //     document.getElementById("saludPnjVisor").innerText = "";
        //     document.getElementById("nombreLabelPnjVisor").innerText = "";

        //     document.getElementById("picasVisor").innerHTML = "";
        //     document.getElementById("corazonesVisor").innerHTML = "";
        //     document.getElementById("trebolesVisor").innerHTML = "";
        //     document.getElementById("diamantesVisor").innerHTML = "";

        //     document.getElementById("pnjCEListVisor").innerHTML = "";
        //     document.getElementById("pnjEquipoListVisor").innerHTML = "";
    }
}

function actulizarListadoPnjsObjetivo() {
    let root = document.getElementsByName('selPnjChecks');
    for (let i = 0; i < root.length; i++) {
        root[i].innerHTML = "";
    }

    partida.pnjsEscena.forEach(personaje => {
        selectoresPnjsHTML(personaje.id, personaje.nombre, 'selPnjChecks');
    });

    actualizarListadoPjsIniciativaNarrativa();

}

function actualizarListadoPjsIniciativaNarrativa() {
    let root = document.getElementById('listadoPjEscenaNarrativa').innerHTML = "";
    // for (let i = 0; i < root.length; i++) {
    //     root[i].innerHTML = "";
    // }

    root = document.getElementById('listadoPjEscenaNarrativa');
    const slideButtonPj = (listado) => {
        listado.forEach(personaje => {
            let i = 0;
            let htmlBase = `<div class = "switch-button" > <input type = "checkbox" name = "pjIniciativaNarrativa" id = "${personaje.nombre}_${i}" class = "switch-button__checkbox" >  <label for = "${personaje.nombre}_${i}" class = "switch-button__label" >${personaje.nombre}</label> </div>`;
            let div = document.createElement('div');
            div.class = "justify-content-center";
            div.innerHTML = htmlBase;
            root.insertAdjacentElement("beforeend", div);
            i++;
        });
    };
    slideButtonPj(partida.personajes);
    slideButtonPj(partida.pnjsEscena);
}

function reiniciarIniciativaNarrativa() {

    let root = document.getElementsByName('pjIniciativaNarrativa');
    for (let i = 0; i < root.length; i++) {
        root[i].checked = false;
    }
}

/**salvar partida */
function salvarPartida() {
    let partidaActiva = localStorage.getItem("partidaActiva");
    if (partidaActiva != null || partidaActiva != undefined) {
        partida.ultimaPartida = new Date();
        document.getElementById("infoEstadoSalvado").innerText = "salvando...";
        setTimeout(() => {
            document.getElementById("infoEstadoSalvado").innerText = "ultimo guardado: " + partida.ultimaPartida;
        }, UN_SEGUNDO);
        console.log("Partida Activa, salvamos partida para el master");
        // deberiamos salvar el id de la partida en partidaActiva, y tener un metodo que salve la partida en las que tenemos creadas.
        localStorage.setItem("partidaActiva", partida.id);
        localStorage.setItem("partidaFW_" + partida.id, JSON.stringify(partida));
    }
}

function exportarPartidaEnJuego() {
    console.log('exportarPartidaEnJuego ');

    writeFile(partida.nombre + ".partida", partida);
}

function solicitudDarExperiencia() {
    console.log("solicitudDarExperiencia()");
    let pjsChecks = document.getElementById("selPjChecksExp");
    let objetivoID;
    for (let item of pjsChecks.children) {
        for (let item2 of item.children) {
            if (item2.checked) objetivoID = item2.value;
        }
    }
    let personaje = partida.personajes.find(jugador => jugador.id == objetivoID);
    // if (personaje.px.length < 5) {
    let pxObj = {
        partida: partida.nombre,
        fecha: Date.now(),
        gastado: ""
    };
    personaje.px.push(pxObj);
    console.log(personaje.px);
    alert(`Otorgado Px a ${personaje.nombre} y ya tiene ${personaje.px.length} puntos de experiencia.`);
    // } else {

    // }
    // ahora hay que enviar el mensaje y historificarlo
    let pjNombre = personaje.nombre;
    let mensaje = `<td>${pjNombre}</td><td>Ha Obtenido un Punto de Experiencia.</td>`;

    let solicitudDarPxJSON = {
        ESTATUS: "HISTORICO",
        ID_PARTIDA: partida.id,
        ID_JUGADOR: personaje.id,
        SOLICITUD: personaje,
        RESPUESTA: mensaje,
        CONTADOR: contadorResultadoActual++
    };

    historificarResultado(solicitudDarPxJSON);
    solicitar("SERVER-partida&solicitudAplicarEfecto", resolver, notOK, solicitudDarPxJSON);
}

// function