/*jshint esversion: 8 */
//revisar, codigo repetido, en personajeFW estamos aunando mucho de esto


function cargarPersonajesGuardados() {

    let personajesFW = JSON.parse(localStorage.getItem("personajesFW"));
    if (personajesFW == undefined || personajesFW == null) {
        personajesFW = [];
    }

    let populate = (descripcionesPersonajes) => {

        movimientos = descripcionesPersonajes.movimientos;
        equipo = descripcionesPersonajes.equipo;
        estados_salud = descripcionesPersonajes.estados_salud;

        for (let i = 0; i < personajesFW.length; i++) {
            let pjGuardado = localStorage.getItem(personajesFW[i]);
            if (pjGuardado != null) {
                fichaHTML(i);
                let personaje = JSON.parse(pjGuardado);
                cargarPersonaje(i, personaje);
            }
        }
    };
    cargarJson('descripcionesPersonajes.json', populate);
}



function cargarPersonaje(i, personaje) {

    document.getElementById('descripcionPJ_' + i).style = "block";

    document.getElementById('personaje_' + i).innerHTML = personaje.nombre;
    document.getElementById('desc_' + i).innerText = personaje.descripcion;
    document.getElementById('logoJuego_' + i).src = `../imagenes/rolinapp/logo${personaje.juego}horizontal.png`;
    document.getElementById('clase_' + i).innerText = personaje.clase;
    document.getElementById('fotoPj_' + i).innerHTML = ` <img class="fl-l w-50" src="../imagenes/rolinapp/${personaje.clase}.jpg" style="width: 100%; height:auto;" />`;
    document.getElementById('especial_' + i).innerHTML = `El ${personaje.nombre} resuelve los checkeos de ${personaje.habEspecial} con ${personaje.palo}`;
    puntuarHab(personaje.habilidades.picas, "picas", document.getElementById('picas_' + i));
    puntuarHab(personaje.habilidades.treboles, "treboles", document.getElementById('treboles_' + i));
    puntuarHab(personaje.habilidades.corazones, "corazones", document.getElementById('corazones_' + i));
    puntuarHab(personaje.habilidades.diamantes, "diamantes", document.getElementById('diamantes_' + i));

    let botonBorrar = document.getElementById('id_pj_' + i);

    if (botonBorrar != undefined) {
        botonBorrar.value = personaje.id;
    }

    let rellenarListado = (elementPadre, arrayElementosHijos, descripciones) => {
        // console.log(arrayElementosHijos);
        arrayElementosHijos.map(element => {
            let div = document.createElement("li");
            div.textContent = descripciones.find((el) => el.id == element).nombre;
            elementPadre.insertAdjacentElement("beforeend", div);
        });
    };
    // // console.log(personaje.equipo);
    rellenarListado(document.getElementById('ce_' + i), personaje.movimientos, movimientos);
    rellenarListado(document.getElementById('equipo_' + i), personaje.equipo, equipo);

}

function borrarPersonaje(btn) {
    let id = Number(btn.value);
    let personajesFW = JSON.parse(localStorage.getItem("personajesFW"));
    console.log(personajesFW);
    let pos = personajesFW.indexOf(id);
    personajesFW.splice(pos, 1);
    console.log(personajesFW);
    localStorage.setItem("personajesFW", JSON.stringify(personajesFW));
    localStorage.removeItem(id);
    location.reload();
}

window.onload = cargarPersonajesGuardados();