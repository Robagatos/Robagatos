/*jshint esversion: 6 */

var puntosHab = 7;
var puntosEquipo = 0;
var puntosCapacidadesEspeciales = 0;
var claseSel;
let juegoEscogidoParam;

function init() {

    console.log("cargando init");
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    juegoEscogidoParam = urlParams.get('juegoEscogido');



    document.getElementById('puntosHab').innerHTML = puntosHab;

    let populate = (jsonObj) => {

        personajes = jsonObj.personajes;
        movimientos = jsonObj.movimientos;
        equipo = jsonObj.equipo;
        estados_salud = jsonObj.estados_salud;

        document.getElementById('pistolero').innerHTML = personajes.pistolero.descripcion;
        document.getElementById('cowboy').innerHTML = personajes.cowboy.descripcion;
        document.getElementById('tahur').innerHTML = personajes.tahur.descripcion;
        document.getElementById('predicador').innerHTML = personajes.predicador.descripcion;

        mostrarDesc("pistolero");
    };

    cargarDescripcionesPersonajes(populate);

}

function mostrarDesc(key) {

    document.getElementById('pistolero').style.display = "none";
    document.getElementById('cowboy').style.display = "none";
    document.getElementById('tahur').style.display = "none";
    document.getElementById('predicador').style.display = "none";

    document.getElementById('fotoPj').innerHTML = ``;
    document.getElementById(key).style.display = "block";
    claseSel = key;
    cambiarClasePersonaje(key);

}

function setPuntoHab(checkHab) {

    let idChar = checkHab.id.substring(0, 1);
    let idNum = parseInt(checkHab.id.substring(1, 2));
    let nextidNum = idNum + 1;
    let nextId = idChar + nextidNum;
    let element = document.getElementById(nextId);
    if (checkHab.checked) {
        puntosHab--;

        if (element != null)
            element.disabled = false;
        if (idNum > 1) {
            let previdNum = idNum - 1;
            let prevId = idChar + previdNum;
            document.getElementById(prevId).disabled = true;
        }


    } else {
        puntosHab++;
        if (puntosHab == 1) {
            let habs = ['p', 't', 'c', 'd'];
            for (let i of habs) {
                for (let v = 1; v <= 5; v++) {
                    let id = i + v;
                    let elem = document.getElementById(id);

                    if (!elem.checked) {
                        elem.disabled = false;
                        break;
                    }
                }
            }
        } else {

        }
        if (element != null)
            document.getElementById(nextId).disabled = true;

        if (idNum > 1) {
            let previdNum = idNum - 1;
            let prevId = idChar + previdNum;
            document.getElementById(prevId).disabled = false;
        }
    }

    document.getElementById('puntosHab').innerHTML = puntosHab;

    if (puntosHab == 0) {
        let habs = ['p', 't', 'c', 'd'];
        for (let i of habs) {
            for (let v = 1; v <= 5; v++) {
                let id = i + v;
                let elem = document.getElementById(id);
                if (!elem.checked) elem.disabled = true;
            }
        }
    }
    mostrarBotonAceptar();
}


function cambiarClasePersonaje(personajeNuevo) {
    if (personajes != undefined) {
        document.getElementById('fotoPj').innerHTML = ` <img class="fl-l w-50" src="../imagenes/rolinapp/${personajeNuevo}.jpg" style="width: 100%; height:auto;" />`;
        document.getElementById('nombreClase').innerText = personajes[personajeNuevo].nombre;
        document.getElementById('habEspecial').innerText = personajes[personajeNuevo].habEspecial;
        document.getElementById('palo').innerText = personajes[personajeNuevo].palo;

        //movimientos:
        puntosCapacidadesEspeciales = personajes[personajeNuevo].puntosCE;
        for (let i = 1; i < 5; i++) {

            let elem = document.getElementById('idMov' + i);
            let mov = movimientos.find((ele) => ele.id == personajes[personajeNuevo].movimientos[i]);
            let valor = mov.id;
            elem.innerHTML = valor;
            elem = document.getElementById('movNombre' + i);
            valor = mov.nombre;
            elem.innerHTML = valor;
            elem = document.getElementById('movDesc' + i);
            elem.innerHTML = mov.descripcion;
            document.getElementById('m' + i).style.display = "block";
        }

        //equipo
        puntosEquipo = personajes[personajeNuevo].puntosEquipo;
        for (let i = 1; i <= 5; i++) {
            let elem = document.getElementById('idEquipo' + i);
            let piezaEquipo = equipo.find((equ) => equ.id == personajes[personajeNuevo].equipo[i - 1]);
            let valor = piezaEquipo.id;
            elem.innerHTML = valor;
            elem = document.getElementById('equipoNombre' + i);
            valor = piezaEquipo.nombre;
            elem.innerHTML = `<b>${valor}</b>: `;
            elem = document.getElementById('equipoDesc' + i);
            elem.innerHTML = piezaEquipo.descripcion;
            document.getElementById('eq' + i).style.display = "block";
        }


        let textoCE = document.getElementById('puntosCapacidadesEspeciales');
        textoCE.innerHTML = textoCE.innerHTML.replace('puntosCapacidadesEspeciales', puntosCapacidadesEspeciales);
        let textoEquipo = document.getElementById('textoDescEquipo');
        textoEquipo.innerHTML = textoEquipo.innerHTML.replace('puntosEquipo', puntosEquipo);
        for (let v = 1; v < 5; v++) {
            let id = "mov" + v;
            let elem = document.getElementById(id);
            elem.disabled = false;
            id = "equipo" + v;
            elem = document.getElementById(id);
            elem.disabled = false;
        }
    }
}

function setPuntoCE(ce) {

    if (ce.checked) {
        puntosCapacidadesEspeciales--;
    } else {
        puntosCapacidadesEspeciales++;
    }
    let deshabilitar = false;
    if (puntosCapacidadesEspeciales == 0) {
        deshabilitar = true;
    }
    for (let v = 1; v < 5; v++) {
        let id = "mov" + v;
        let elem = document.getElementById(id);
        if (!elem.checked) elem.disabled = deshabilitar;
    }
    mostrarBotonAceptar();
}


function setPuntoEquipo(equipo) {
    if (equipo.checked) {
        puntosEquipo--;
    } else {
        puntosEquipo++;
    }
    let deshabilitar = false;
    if (puntosEquipo == 0) {
        deshabilitar = true;
    }
    for (let v = 1; v <= 5; v++) {
        let id = "equipo" + v;
        let elem = document.getElementById(id);
        if (!elem.checked) elem.disabled = deshabilitar;
    }
    mostrarBotonAceptar();
}

function mostrarBotonAceptar() {
    let element = document.getElementById("aceptar");
    let elementInfo = document.getElementById("info");
    let elementNombre = document.getElementById("nombre");
    if (puntosEquipo == 0 && puntosCapacidadesEspeciales == 0 && puntosHab == 0 && elementNombre.value != "") {
        element.style.display = "block";
        elementInfo.style.display = "none";
    } else {
        element.style.display = "none";
        elementInfo.style.display = "block";
    }
}

function crearPersonaje() {

    function populate(ficha) {

        ficha.nombre = document.getElementById("nombre").value;
        ficha.id = Date.now();
        ficha.descripcion = document.getElementById("descripcion").value;
        ficha.clase = claseSel;
        ficha.juego = juegoEscogidoParam;

        ficha.habEspecial = personajes[claseSel].habEspecial;
        ficha.palo = personajes[claseSel].palo;

        let contarPuntosHab = (hab) => {
            let contador = 0;
            for (let v = 1; v <= 5; v++) {
                let id = hab + v;
                let elem = document.getElementById(id);

                if (elem.checked) {
                    contador++;
                }
            }
            return contador;
        };

        ficha.habilidades.picas = contarPuntosHab("p");
        ficha.habilidades.treboles = contarPuntosHab("t");
        ficha.habilidades.corazones = contarPuntosHab("c");
        ficha.habilidades.diamantes = contarPuntosHab("d");


        for (let v = 1; v <= 5; v++) {
            let id = "mov" + v;
            let elem = document.getElementById(id);
            let movKey = document.getElementById("idMov" + v).innerHTML;
            if (elem.checked) ficha.movimientos.push(movKey); //[movKey] = movKey;
        }

        for (let v = 1; v <= 5; v++) {
            let id = "equipo" + v;
            let elem = document.getElementById(id);
            let equipoKey = document.getElementById("idEquipo" + v).innerHTML;
            if (elem.checked) ficha.equipo.push(equipoKey); //[equipoKey] = equipoKey;
        }
        localStorage.setItem(ficha.id, JSON.stringify(ficha));
        let personajesFW = JSON.parse(localStorage.getItem("personajesFW"));
        if (personajesFW == undefined || personajesFW == null) {
            personajesFW = [];
        }
        personajesFW.push(ficha.id);
        localStorage.setItem("personajesFW", JSON.stringify(personajesFW));
    }

    cargarJson('fichaFW.json', populate);
}


window.onload = init();