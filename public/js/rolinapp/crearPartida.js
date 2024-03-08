/*jshint esversion: 6 */

function crearPartida() {
    let partidaBase = {
        "id": "",
        "nombre": "",
        "personajes": [],
        "personajesActuales": [],
        "pnjs": [],
        "pnjsEscena": [],
        "equipoCustom": [],
        "fechaCreacion": "",
        "ultimaPartida": "",
        "notas": "",
        "juego": "",
        "publica": true
    };

    let nombre = document.getElementById('nombre').value;
    if (nombre == "") {
        document.getElementById('info').style.display = "block";
    } else {
        document.getElementById('info').style.display = "none";
        partidaBase.id = Date.now();
        partidaBase.nombre = nombre;
        partidaBase.juego = getSelectValue(document.getElementById("juegoEscogido"));
        partidaBase.fechaCreacion = new Date().toLocaleDateString();
        partidaBase.notas = document.getElementById('notas').value;
        localStorage.setItem("partidaFW_" + partidaBase.id, JSON.stringify(partidaBase));
        // reset
        document.getElementById('nombre').value = "";
        document.getElementById('notas').value = "";
        let partidas = JSON.parse(localStorage.getItem("partidasFW"));
        if (partidas == undefined || partidas == null) {
            partidas = [];
        }
        partidas.push(partidaBase.id);
        localStorage.setItem("partidasFW", JSON.stringify(partidas));
        listarPartidas();
    }
}

function listarPartidas() {
    let root = document.getElementById('accordion');
    root.innerHTML = "";
    let partidas = JSON.parse(localStorage.getItem("partidasFW"));

    if (partidas != undefined && partidas != null) {
        partidas.forEach(element => {
            let partida = JSON.parse(localStorage.getItem("partidaFW_" + element));
            partida.personajesActuales = [];
            if (!partida.publica) {
                console.log("Reseteamos partidaPublica");
                partida.publica = true;
                localStorage.setItem("partidaFW_" + partida.id, JSON.stringify(partida));
            }

            partidaHTML(partida.id);

            document.getElementById('nombre_' + partida.id).innerText = partida.nombre;
            document.getElementById('descripcion_' + partida.id).style = "block";
            document.getElementById('partida_' + partida.id).innerText = partida.nombre;
            document.getElementById('notas_' + partida.id).innerText = partida.notas;
            document.getElementById('juego_' + partida.id).innerHTML = `<img class="w-50 img-fluid rounded float" src="../imagenes/rolinapp/logo${partida.juego}horizontal.png" />`;
            document.getElementById('creacion_' + partida.id).innerText = partida.fechaCreacion;
            document.getElementById('ultimaPartida_' + partida.id).innerText = partida.ultimaPartida;
            let rootJugadores = document.getElementById('pjs_' + partida.id);
            partida.personajes.forEach(jugador => {
                console.log(jugador.nombre);
                let row = document.createElement('li');
                row.innerText = jugador.nombre;
                rootJugadores.insertAdjacentElement("beforeend", row);
            });

        });
    }
}

function iniciarPartida(id) {
    console.log('iniciarPartida ' + id);
    redirigirPagina("partidaDirectorFW?partida=" + id);
}

function borrarPartida(id) {
    console.log('borrarPartida ' + id);

    let partidas = JSON.parse(localStorage.getItem("partidasFW"));
    partidas = partidas.filter(idPartida => idPartida != id);
    localStorage.setItem("partidasFW", JSON.stringify(partidas));

    localStorage.removeItem(id);

    listarPartidas();
}

function exportarPartida(id) {
    console.log('exportarPartida ' + id);
    let partida = JSON.parse(localStorage.getItem("partidaFW_" + id));
    writeFile(partida.nombre + ".partida", partida);
}

function importarPartida() {
    console.log('importarPartida ');
    let reader = loadFile();
    reader.onloadend = () => {
        let result = reader.result;
        let partida = JSON.parse(result);
        let partidas = JSON.parse(localStorage.getItem("partidasFW"));
        if (partidas == undefined || partidas == null) {
            partidas = [];
        }
        let encontrada = partidas.find(elemento => partida.id == elemento);

        if (encontrada == undefined) {
            partidas.push(partida.id);
            localStorage.setItem("partidasFW", JSON.stringify(partidas));
            localStorage.setItem("partidaFW_" + partida.id, result);
        }

        listarPartidas();
    };

}



window.onload = listarPartidas();