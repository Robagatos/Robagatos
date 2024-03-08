// este js es para testeos de reglas y de procesos
// hay que sacar estadisticas de las reglas de juego y ver cuales son mejores. para ello necesitamos dos pistoleros y varias configuraciones para ellos
// debemos poder tener diferentes habilidades (1, 2, 3), armas (1, 2, 3) y protecciones (1, 2, 3). y ademas, tienen diferentes maneras de ser afectados.

const { clear } = require("console");

//debemos recoger todo los datos en estadisticas de mil combates y ver que resultados tenemos.
let heridas = [0, 0, 0];
let disparosEfectuados = [0, 0];
let turnoMaximo = 0;
let estadisticas = {
    Jimmy: 0,
    Bob: 0
};
let iniciativa = [];
let saludLiteral = ["Sano", "Leve", "Grave", "Mortal"];


const tablaHeridasMap = function() {

    let t0 = function(d10) {
        let herida = 1;
        switch (d10) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                break;
            case 8:
            case 9:
                herida = 2;
                break;
            case 10:
                herida = 3;
        }
        return herida;
    };
    let t1 = function(d10) {
        let herida = 1;
        switch (d10) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            case 6:
            case 7:
            case 8:
                herida = 2;
                break;
            case 9:
            case 10:
                herida = 3;
        }
        return herida;
    };
    let t2 = function(d10) {
        let herida = 1;
        switch (d10) {
            case 1:
            case 2:
            case 3:
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                herida = 2;
                break;
            case 8:
            case 9:
            case 10:
                herida = 3;
        }
        return herida;
    };
    let t3 = function(d10) {
        let herida = 1;
        switch (d10) {
            case 1:
            case 2:
                break;
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                herida = 2;
                break;
            case 8:
            case 9:
            case 10:
                herida = 3;
        }
        return herida;
    };
    let t4 = function(d10) {
        let herida = 1;
        switch (d10) {
            case 1:
            case 2:
                break;
            case 3:
            case 4:
            case 5:
                herida = 2;
                break;
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                herida = 3;
        }
        return herida;
    };
    let t5 = function(d10) {
        let herida = 1;
        switch (d10) {
            case 1:
                break;
            case 2:
            case 3:
            case 4:
                herida = 2;
                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                herida = 3;
        };
        return herida;
    };
    let thMap = [t0, t1, t2, t3, t4, t5];
    return thMap;
};


class Pistolero {
    constructor(nombre, habilidad = 0, arma = 0, ocultacion = 0, proteccion = 0) {
        this.nombre = nombre;
        this.habilidad = habilidad;
        this.arma = arma;
        this.proteccion = proteccion;
        this.salud = 0;
        this.municion = true;
        this.penalizacionArma = false;
        this.ocultacion = ocultacion;

        this.getOcultacion = function() {
            return ocultacion;
        }
        this.getHabilidad = function() {
            let result = habilidad;
            result -= this.getSalud();
            if (result < 0) result = 0;
            return result;
        };

        this.getProteccion = function() {
            let result = this.proteccion;
            result -= this.getSalud();
            if (result < 0) result = 0;
            return result;

        }
        this.getSalud = () => {
            return this.salud;
        }
        this.getDañoArma = function() {
            if (this.penalizacionArma) {
                this.penalizacionArma = false;
                return 0;
            } else {
                return this.arma;
            }
        };

        this.disparar = function(proteccionObjetivo) {

            let totalAccion = this.getHabilidad() - proteccionObjetivo;
            // // console.log(this.nombre + " tiene un total hab " + totalAccion + " (params " + proteccionObjetivo);
            if (totalAccion < 1) {
                let tiradas = [0, 0];
                tiradas[0] = this.accion(1);
                tiradas[1] = this.accion(1);
                return ordenarMenorMayor(tiradas)[0];
            }
            return this.accion(totalAccion);
        };

        this.herir = (armaEnemiga) => {
            let totalAccion = armaEnemiga - this.getProteccion();
            // // console.log("\therir params armaEnemiga " + armaEnemiga + " this.proteccion " + this.getProteccion() + " totalAccion " + totalAccion);
            if (totalAccion < 1) {
                let tiradas = [0, 0];
                tiradas[0] = this.accion(1);
                tiradas[1] = this.accion(1);
                let tirada = ordenarMenorMayor(tiradas)[0];
                // // console.log("\t\therida menor " + tiradas + " se queda con " + tirada);
                return this.herido(tirada, armaEnemiga);
            } else {
                let resutltadoAccionHerida = this.accion(totalAccion);
                // // console.log("\t\t\therida mayor " + resutltadoAccionHerida);
                return this.herido(resutltadoAccionHerida, armaEnemiga);
            }
        };

        this.penalizarDaño = function() {
            // // console.log("\t\t" + this.nombre + " impacta como puede!");
            this.penalizacionArma = true;
        };

        this.herido = function(d10, armaEnemiga) {
            // // console.log("\t\tvalor herida " + d10);
            // let tabla = tablaHeridasMap()[armaEnemiga];
            // console.log(tabla);
            let herida = 1; //tabla(d10);
            switch (d10) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                    break;
                case 7:
                case 8:
                case 9:
                    herida = 2;
                    break;
                case 10:
                    herida = 3;
            }
            if (this.salud == herida) {
                // console.log("(elevacion de herida)");
                herida++;
            }
            if (herida > this.salud)
                this.salud = herida;
            heridas[herida - 1]++;
            return herida;
        };

        this.sinMunicion = function() {
            // console.log("\t\t" + this.nombre + " se ha quedado sin municion!");
            this.municion = false;
        };

        this.puedeDisparar = function() {
            if (this.municion) {
                // // console.log(this.nombre + " aun tiene balas");
                return true;
            } else {
                // console.log("*<- ->* " + this.nombre + " ¡Recargando!");
                this.municion = true;
                return false;
            }
        };

        this.accion = function(valor) {
            let tiradas = [];
            for (let i = 0; i < valor; i++) {
                tiradas[i] = tirada();
            }
            tiradas = ordenarMayorMenor(tiradas);

            return tiradas[0];
        }
    };

};


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

// proteccion tira dados


function tirada() {
    return Math.floor((Math.random() * (10)) + 1);
}

function resultadoAccion(d10) {
    let result = "fallo";
    switch (d10) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            break;
        case 6:
        case 7:
            result = "parcial";
            break;
        case 8:
        case 9:
        case 10:
            result = "exito";
    }
    // // console.log("resultadoAccion " + result)
    return result;
}

function resultadoDisparo(tiradorUno, tiradorDos) {
    if (tiradorUno.puedeDisparar()) {
        // console.log("*<- DISPARA " + tiradorUno.nombre + ", en estado de salud " + saludLiteral[tiradorUno.salud]);
        let impactar = (tirador, balazo) => {
                let result = false;
                switch (resultadoAccion(balazo)) {
                    case "fallo":
                        break;
                    case "parcial":
                        if (tirada(1) % 2 == 0 ? true : false) {
                            tirador.sinMunicion();
                        } else {
                            tiradorUno.penalizarDaño();
                        }
                        // vamos a herir, asi que ejecutamos el siguiente caso igualmente
                    case "exito":
                        result = true;
                        break;
                }
                // // console.log(tirador.nombre + " dispara y " + result);
                return result;
            }
            //el tirador A dispara a B
        let impacta = impactar(tiradorUno, tiradorUno.disparar(tiradorDos.getOcultacion()));
        if (impacta) {
            disparosEfectuados[1]++;
            //veamos si le hiere
            let herida = tiradorDos.herir(tiradorUno.getDañoArma());
            // console.log("*-> " + tiradorUno.nombre + " hiere a " + tiradorDos.nombre + " con una herida " + saludLiteral[herida]);
            if (herida == 3) return true;
        } else {
            disparosEfectuados[0]++;
            // console.log("*-> ¡FALLA EL DISPARO!");
        }
    }
    return false;
}
// proteccion resta dados
function duelo(tiradorA, tiradorB) {

    let finDuelo = resultadoDisparo(tiradorA, tiradorB);
    //comprobamos si el tiradorA acaba con el B, sino, B dispara a A. si uno acaba con el otro, se envia finDeDuelo.
    if (finDuelo) {
        // console.log("-> HA VENCIDO " + tiradorA.nombre);
        estadisticas[tiradorA.nombre]++;
        return finDuelo;
    } else {
        finDuelo = resultadoDisparo(tiradorB, tiradorA);
        if (finDuelo) {
            // console.log("-> HA VENCIDO " + tiradorB.nombre);
            estadisticas[tiradorB.nombre]++;
        }
    }
    return finDuelo;
}


function estadisticasDados(valor) {
    let resultados = [0, 0, 0];
    let valores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let pistoleroA = new Pistolero("Jimmy", valor, 1);
    let contadorTiradas = 10000000;
    for (let i = 0; i < contadorTiradas; i++) {
        let tirada = pistoleroA.disparar(0);
        valores[tirada]++;
        let resultado = resultadoAccion(tirada);
        switch (resultado) {
            case "fallo":
                resultados[0]++;
                break;
            case "parcial":
                resultados[1]++;
                break;
            case "exito":
                resultados[2]++;
                break;
        }
    }
    let divisor = 100000;
    console.log("RESULTADOS PARA " + pistoleroA.getHabilidad());
    console.log("Fallos: " + Math.round(resultados[0] / divisor));
    console.log("Parciales: " + Math.round(resultados[1] / divisor));
    console.log("Exitos: " + Math.round(resultados[2] / divisor));
    // console.log("RESULTADOS DE TIRADAS: ");
    valores.map((value, index, array) => {
        console.log("tirada valor " + index + ": " + value);
    });

    console.log("\n");
}



function estadisticasDaño(valor) {

    let resultados = [0, 0, 0, 0];
    let pistoleroA = new Pistolero("Jimmy");
    let contadorTiradas = 10000000;
    for (let i = 0; i < contadorTiradas; i++) {
        let herida = pistoleroA.herir(valor);
        resultados[herida]++;
    }
    let divisor = 100000;
    console.log("RESULTADOS PARA DAÑO DE " + valor + " DADO");
    console.log("Leves: " + Math.round(resultados[1] / divisor));
    console.log("Graves: " + Math.round(resultados[2] / divisor));
    console.log("Mortales: " + Math.round(resultados[3] / divisor));


    console.log("\n");
}





function mainDuelo() {
    // console.log("Iniciando");
    let contadorDuelos = 1;
    let maxDuelos = 1000;
    for (; contadorDuelos <= maxDuelos; contadorDuelos++) {

        // console.log(contadorDuelos + "º DUELO");

        let pistoleroA = new Pistolero("Jimmy", 3, 2);
        let pistoleroB = new Pistolero("Bob", 3, 2);


        for (let i = 1; i < 1000; i++) {
            if (turnoMaximo < i) turnoMaximo = i;
            // console.log("Turno: " + i); //+ " pistoleroA.getSalud() " + saludLiteral[pistoleroA.getSalud()] + ", pistoleroB.getSalud() " + saludLiteral[pistoleroB.getSalud()]);
            if (pistoleroA.getSalud() < pistoleroB.getSalud()) {
                iniciativa[0] = pistoleroA;
                iniciativa[1] = pistoleroB;
            } else if (pistoleroB.getSalud() < pistoleroA.getSalud()) {
                iniciativa[0] = pistoleroB;
                iniciativa[1] = pistoleroA;
            } else {
                let suerte = tirada(1) % 2 == 0 ? true : false;
                // // console.log("suerte " + suerte);
                if (suerte) {
                    iniciativa[0] = pistoleroA;
                    iniciativa[1] = pistoleroB;
                } else {
                    iniciativa[0] = pistoleroB;
                    iniciativa[1] = pistoleroA;
                }
            }
            // console.log("iniciativa " + iniciativa[0].nombre);
            if (duelo(iniciativa[0], iniciativa[1])) {
                break;
            }
        }
    }
    let total = (disparosEfectuados[0] + disparosEfectuados[1]);
    console.log("\nDuelos vencidos por Jimmy" + ": " + estadisticas['Jimmy'] + " el " + estadisticas['Jimmy'] / 10 + "%");
    console.log("Duelos vencidos por Bob" + ": " + estadisticas['Bob'] + " el " + estadisticas['Bob'] / 10 + "%");
    console.log("\nHERIDAS");
    console.log("leves " + heridas[0] + ", por duelo: " + (heridas[0] / maxDuelos));
    console.log("graves " + heridas[1] + ", por duelo: " + (heridas[1] / maxDuelos));
    console.log("mortales " + heridas[2] + ", por duelo: " + (heridas[2] / maxDuelos));
    console.log("\nDISPAROS EFECTUADOS");
    console.log("fallados " + disparosEfectuados[0] + ", por duelo: " + (disparosEfectuados[0] / maxDuelos) + " el " + Math.round((disparosEfectuados[0] * 100) / total) + "%");
    console.log("acertados " + disparosEfectuados[1] + ", por duelo: " + (disparosEfectuados[1] / maxDuelos) + " el " + Math.round((disparosEfectuados[1] * 100) / total) + "%");
    console.log("TOTAL " + total);
    console.log("Media de disparos por Duelo " + ((disparosEfectuados[0] + disparosEfectuados[1])) / maxDuelos);
    console.log("\nTurno Maximo " + turnoMaximo);
}

mainDuelo();
// estadisticasDados(0);
// estadisticasDados(1);
// estadisticasDados(2);
// estadisticasDados(3);
// estadisticasDados(4);
// estadisticasDados(5);

// estadisticasDaño(0);
// estadisticasDaño(1);
// estadisticasDaño(2);
// estadisticasDaño(3);
// estadisticasDaño(4);
// estadisticasDaño(5);