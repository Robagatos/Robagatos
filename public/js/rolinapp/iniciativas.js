/*jshint esversion: 6 */
// INICIATIVA
let iniciativas = [];
let iniciativaActual = 0;
let fase = 1;
// la idea ahora. en la fase uno la iniciativa se bonifica por Diamantes, y es declaracion de intenciones, todos los que indiquen movimiento se les considera que inician este y estan fuera de cobertura si su trayecto les pone fuera de cobertura. ocultarse o salir a disparar es movimiento.
// la segunda se bonifica con violencia y es disparar, desefundar, recargar. (si se ha declarado accion de movimiento se tiene un -1 a disparar)
// la tercera se bonifica con treboles y son los movimientos en si, se resuelven en este punto, es decir, se iniciaron en el punto 1 y se alcanza destino en este otro.

function iniciativaCalcular() {
    //para pruebas
    iniciativaActual = 0;
    fase = 1;
    iniciativas = [];
    let concatPjsPnjs = partida.pnjsEscena.concat(partida.personajes);
    calcularIniciativas(concatPjsPnjs);
    cambiarFase();
    ciclarIniciativa();
}

function calcularIniciativas(coleccion) {
    for (let i = 1; i < 4; i++) {
        let iniciativasFase = [];
        let iniciativasNumericas = [];
        let iniciativasTemporal = [];
        coleccion.map(pnj => {
            let tiradaIni = Number(checkIniciativa(pnj));
            let volverAtirar = true;
            while (volverAtirar) {
                if (iniciativasNumericas.find(valor => valor == tiradaIni) != undefined) {
                    tiradaIni += tirada();
                } else {
                    volverAtirar = false;
                }
            }
            let objIni = {
                pjId: pnj.id,
                ini: tiradaIni
            };
            iniciativasTemporal.push(objIni);
            iniciativasNumericas.push(tiradaIni);
        });

        let ordenadas = ordenarMayorMenor(iniciativasNumericas);
        console.log("ordenadas: " + ordenadas);
        console.table(iniciativasTemporal);
        let encontrado;
        iniciativasTemporal.find(({ ini }) => ini === "");
        ordenadas.map(iniciativa => {
            encontrado = iniciativasTemporal.find(({ ini }) => ini === iniciativa);
            iniciativasFase.push(encontrado.pjId);
        });
        iniciativas[i] = iniciativasFase;
    }
    console.log(iniciativas);
}

function checkIniciativa(pnj) {
    let d10 = tirada();

    if (fase == 1) {
        d10 += pnj.habilidades.diamantes;
    }
    if (fase == 1) {
        d10 += pnj.habilidades.picas;
        let manoMasRapida = pnj.movimientos.find(mov => mov.id == "pistolero_1");
        if (manoMasRapida != undefined) {
            console.log("+5 por La mano mas rapida");
            d10 += 5;
        }
    }
    if (fase == 1) {
        d10 += pnj.habilidades.treboles;
    }

    d10 *= 10;
    return d10;
}

function iniciativaAnterior() {
    if (iniciativas[fase].length != 0) {
        if (iniciativaActual > 0) {
            iniciativaActual--;
        } else {
            if (fase > 1) {
                fase--;
                iniciativaActual = iniciativas[fase].length - 1;
            }
            cambiarFase();
        }
        ciclarIniciativa();
    }

}

function iniciativaSiguiente() {
    if (iniciativas[fase].length != 0) {
        if (iniciativaActual < iniciativas[fase].length - 1) {
            iniciativaActual++;
        } else {
            if (fase < 3) {
                fase++;
                iniciativaActual = 0;
            }
            cambiarFase();
        }
        ciclarIniciativa();
    }
}

function ciclarIniciativa() {
    let obtenerPjOrPnj = (id) => {
        let pnj = partida.pnjsEscena.find(pnj => pnj.id == id);
        if (pnj == undefined) {
            pnj = partida.personajes.find(pnj => pnj.id == id);
        }
        return pnj;
    };
    if (iniciativaActual != 0) {
        document.getElementById("iniciativaPJAnterior").innerText = obtenerPjOrPnj(iniciativas[fase][iniciativaActual - 1]).nombre;
    } else {
        document.getElementById("iniciativaPJAnterior").innerText = "";
    }

    document.getElementById("iniciativaPJActual").innerText = obtenerPjOrPnj(iniciativas[fase][iniciativaActual]).nombre;
    updateVisor(obtenerPjOrPnj(iniciativas[fase][iniciativaActual]));
    if (iniciativaActual < iniciativas[fase].length - 1) {
        document.getElementById("iniciativaPJSiguiente").innerText = obtenerPjOrPnj(iniciativas[fase][iniciativaActual + 1]).nombre;
    } else {
        document.getElementById("iniciativaPJSiguiente").innerText = "";
    }
}


function cambiarFase() {

    document.getElementById("faseUno").className = "badge badge-pill badge-light";
    document.getElementById("faseDos").className = "badge badge-pill badge-light";
    document.getElementById("faseTres").className = "badge badge-pill badge-light";
    if (fase == 1) {
        document.getElementById("infoIni").innerText = "Fase de declaracion de intenciones, los movimientos se inician en esta fase.";
        document.getElementById("faseUno").className = "badge badge-pill badge-primary";
    } else if (fase == 2) {
        document.getElementById("infoIni").innerText = "Fase de acciones rapidas, los disparos, recargas, desenfudados (solo uno de ellos) se realizan en esta fase.";
        document.getElementById("faseDos").className = "badge badge-pill badge-primary";
    } else if (fase == 3) {
        document.getElementById("infoIni").innerText = "Fase de resolucion de acciones, los movimientos se resuelven en esta fase.";
        document.getElementById("faseTres").className = "badge badge-pill badge-primary";
    }

}