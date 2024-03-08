/*jshint esversion: 8 */
const bbdd = require("../../../bbdd.js");

async function start(params, bodyJson) {

    let respuesta = {
        code: 'KO'
    };
    //test

    if (params.test != undefined) {
        test(bodyJson, respuesta);
    } else if (params.testAwait != undefined) {
        await testAwait(bodyJson, respuesta);
    } else if (params.publicar != undefined) {
        await publicarPartida(bodyJson, respuesta);
    } else if (params.consultarPartidasPublicadas != undefined) {
        await consultarPartidasPublicadas(bodyJson, respuesta);
    } else if (params.solicitarUnirsePartida != undefined) {
        await solicitarUnirsePartida(bodyJson, respuesta);
    } else if (params.consultarCambiosListadoJugadores != undefined) {
        await consultarCambiosListadoJugadores(params, respuesta);
    } else if (params.solicitarAceptarPJ != undefined) {
        await solicitarAceptarPJ(bodyJson, respuesta);
    } else if (params.consultarJugadorAceptado != undefined) {
        await consultarJugadorAceptado(params, respuesta);
    } else if (params.solicitarPrivatizarPartida != undefined) {
        await solicitarPrivatizarPartida(bodyJson, respuesta);
    } else if (params.consultarObtenerPartida != undefined) {
        await consultarObtenerPartida(params, respuesta);
    } else if (params.solicitarCheck != undefined) {
        await solicitarCheck(bodyJson, respuesta);
    } else if (params.consultarChecksPendientes != undefined) {
        await consultarChecksPendientes(params, respuesta);
    } else if (params.aceptarCheck != undefined) {
        await aceptarCheck(bodyJson, respuesta);
    } else if (params.consultarChecksAceptados != undefined) {
        await consultarChecksAceptados(params, respuesta);
    } else if (params.publicarResultado != undefined) {
        await publicarResultado(bodyJson, respuesta);
    }
    // else if (params.consultarResultadoPublicado != undefined) {
    //     consultarResultadoPublicado(params, respuesta);
    // } 
    else if (params.solicitudAplicarEfecto != undefined) {
        await solicitudAplicarEfecto(bodyJson, respuesta);
    } else if (params.consultasParaJugador != undefined) {
        await consultasParaJugador(params, respuesta);
    } else if (params.consultarPartidaActiva != undefined) {
        await consultarPartidaActiva(params, respuesta);
    } else if (params.solicitarDuelo != undefined) {
        await solicitarDuelo(bodyJson, respuesta);
    } else if (params.solicitarTiradas != undefined) {
        await solicitarTiradas(bodyJson, respuesta);
    }




    // // console.log(respuesta);

    let respuestaLiteral = JSON.stringify(respuesta);
    // // console.log(respuestaLiteral);
    return respuestaLiteral;
};

function test(params, respuesta) {
    respuesta.code = 'OK';
}
async function testAwait(params, respuesta) {
    return await test(params, respuesta);
}

async function obtenerTodasLasPartidas() {
    // // console.log("Entra en obtenerTodasLasPartidas");
    try {
        let hoy = new Date();
        let filas = await bbdd.fetchData(`SELECT * FROM PARTIDAS WHERE DATE(FECHA)='${hoy.getFullYear()}-${hoy.getMonth()+1}-${hoy.getDate()}' AND ESTADO=1`);
        return filas;
    } catch (exception) {
        persistExceptionBBDD(exception);
    }
    return undefined;
};

async function obtenerPartida(id_partida) {
    // console.log("Entra en obtenerPartida ".id_partida);

    try {
        let filas = await bbdd.fetchData(`SELECT * FROM PARTIDAS WHERE ID_PARTIDA =${id_partida}`);

        return filas[0];
    } catch (exception) {
        persistExceptionBBDD(exception);
    }
    return undefined;
}
// QUE QUEREMOS SALVAR EN ESTE PUNTO?
// async function  salvarPartida(partida) {

//     //ahora partida tiene mas campos

//     await bbdd.fetchData(`UPDATE PARTIDAS SET PARTIDA = ${partida}, NOMBRE='' WHERE ID = ${partida.id}`);

// };

async function publicarPartida(bodyJson, respuesta) {
    //console.log("Entra en publicarPartida ", bodyJson);
    try {
        let filas = await bbdd.fetchData(`SELECT ID_PARTIDA FROM PARTIDAS WHERE FECHA < NOW() - INTERVAL 1 DAY`);
        for (const iterator of filas) {
            let query = `DELETE FROM SOLICITUDES WHERE ID_PARTIDA = ${iterator.ID_PARTIDA}`;
            await bbdd.fetchData(query);
            query = `DELETE FROM PARTIDAS WHERE ID_PARTIDA = ${iterator.ID_PARTIDA}`;
            await bbdd.fetchData(query);
        }
        let partida = await obtenerPartida(bodyJson.id);
        if (partida == undefined) {
            let estado = bodyJson.publica ? 1 : 0;
            let formatFechaCreacion = bodyJson.fechaCreacion.split("/");
            let fechaCreacion = `${formatFechaCreacion[2]}-${formatFechaCreacion[1]}-${formatFechaCreacion[0]}`;
            let formatFechaUltima = fechaCreacion;
            if (bodyJson.ultimaPartida.indexOf(".") != -1) {
                formatFechaUltima = bodyJson.ultimaPartida.split(".")[0];
            }

            let query = `INSERT INTO PARTIDAS (FECHA, ID_PARTIDA, NOMBRE, JUEGO, JUGADORES, ESTADO, DESCRIPCION, FECHA_CREACION, FECHA_ULTIMA) VALUES ( NOW(), ${bodyJson.id},'${bodyJson.nombre}','${bodyJson.juego}','${bodyJson.personajes}',${estado},'${bodyJson.notas}','${fechaCreacion}','${formatFechaUltima}')`;
            // console.log(query);
            await bbdd.fetchData(query);
        } else {
            // console.log("entra en update partida");
            //revisar
            await bbdd.fetchData(`UPDATE PARTIDAS SET FECHA = NOW(), JUGADORES = '${bodyJson.personajes}' WHERE ID_PARTIDA = ${bodyJson.id}`);
        }
        respuesta.code = 'OK';
    } catch (exception) {
        persistExceptionBBDD(exception);
    }

}

function persistExceptionBBDD(exception) {
    let query = `INSERT INTO EXCEPCIONES (FECHA, ERROR) VALUES ( NOW(), ${exception})`;
    bbdd.fetchData(query);
}
async function consultarPartidasPublicadas(bodyJson, respuesta) {
    // // // console.log('entra en SERVER-partida.consultarPartidasPublicadas ');
    let listadoPartidas = await obtenerTodasLasPartidas();
    respuesta.partidas = [];

    for (const key in listadoPartidas) {
        if (Object.hasOwnProperty.call(listadoPartidas, key)) {
            const element = listadoPartidas[key];

            //hay que montar el elemento partida:
            let partida = {
                id: element.ID_PARTIDA,
                nombre: element.NOMBRE,
                personajes: element.JUGADORES,
                fechaCreacion: element.FECHA_CREACION,
                ultimaPartida: element.FECHA_ULTIMA,
                notas: element.DESCRIPCION,
                juego: element.JUEGO,
                publica: element.ESTADO
            };
            respuesta.code = 'OK';
            respuesta.partidas.push(partida);
        }
    }

}

async function solicitarUnirsePartida(bodyJson, respuesta) {
    // console.log('entra en SERVER-partida.solicitarUnirsePartida ');
    // console.log(bodyJson);
    // obtenemos 
    let filas = await bbdd.fetchData(`SELECT ID_JUGADOR FROM SOLICITUDES WHERE ID_PARTIDA =${bodyJson.id} AND ID_JUGADOR = '${bodyJson.pj.id}'`);

    if (filas.length == 0) {

        let pj = JSON.stringify(bodyJson.pj);
        let query = `INSERT INTO SOLICITUDES (ID_PARTIDA, ID_JUGADOR, SOLICITUD,ESTADO) VALUES (${bodyJson.id},'${bodyJson.pj.id}','${pj}','SOLICITUD')`;
        await bbdd.fetchData(query);
        // console.log('insertando solicitud: ', query);
    } else {
        let query = `UPDATE SOLICITUDES SET ESTADO = 'SOLICITUD' WHERE ID_PARTIDA =${bodyJson.id} AND ID_JUGADOR =  '${bodyJson.pj.id}'`;
        await bbdd.fetchData(query);
    }
    respuesta.code = 'OK';

    // console.log("SALIENDO");

};

//MASTER
async function consultarCambiosListadoJugadores(params, respuesta) {
    // console.log('entra en SERVER-partida.consultarCambiosListadoJugadores ', params.consultarCambiosListadoJugadores);

    let filas = await bbdd.fetchData(`SELECT ID, SOLICITUD FROM SOLICITUDES WHERE ID_PARTIDA =${params.consultarCambiosListadoJugadores} AND ESTADO = 'SOLICITUD'`);

    // // console.log(filas);
    if (filas.length > 0) {
        respuesta.code = 'OK';
        for (const key in filas) {
            if (Object.hasOwnProperty.call(filas, key)) {
                const element = filas[key];
                respuesta.pjs = element.SOLICITUD;
                let query = `UPDATE SOLICITUDES SET ESTADO = 'PENDING' WHERE ID=${element.ID}`;
                // console.log(query);
                await bbdd.fetchData(query);
            }
        }

    }
};


async function solicitarAceptarPJ(bodyJson, respuesta) {
    // console.log('entra en SERVER-partida.solicitarAceptarPJ ', bodyJson.partidaID);

    let query = `UPDATE SOLICITUDES SET RESPUESTA = '${bodyJson.pjs}', ESTADO = 'ACEPTADO' WHERE ID_PARTIDA =${bodyJson.partidaID} AND ID_JUGADOR =  '${bodyJson.idJugador}'`;
    // console.log(query);
    await bbdd.fetchData(query);
    query = `UPDATE PARTIDAS SET JUGADORES = '${bodyJson.pjs}' WHERE ID_PARTIDA =${bodyJson.partidaID}`;
    // console.log(query);
    await bbdd.fetchData(query);
    respuesta.code = 'OK';
}

async function consultarJugadorAceptado(params, respuesta) {
    //console.log('entra en SERVER-partida.consultarJugadorAceptado ', params);
    let filas = await bbdd.fetchData(`SELECT RESPUESTA FROM SOLICITUDES WHERE ID_PARTIDA =${params.idPartida} AND ESTADO = 'ACEPTADO'`);
    for (const key in filas) {
        if (Object.hasOwnProperty.call(filas, key)) {
            const element = filas[key];
            // console.log(element.RESPUESTA);
            respuesta.code = 'OK';
            respuesta.idPartida = params.idPartida;
            respuesta.pjs = element.RESPUESTA;
            let query = `UPDATE SOLICITUDES SET ESTADO = 'CERRADO' WHERE ID_PARTIDA =${params.idPartida} AND ID_JUGADOR =  '${params.consultarJugadorAceptado}'`;
            bbdd.fetchData(query);
        }
    }
}

async function solicitarPrivatizarPartida(bodyJson, respuesta) {
    // console.log('entra en SERVER-partida.solicitarPrivatizarPartida ', bodyJson);
    let estado = bodyJson.publica ? 1 : 0;
    let query = `UPDATE PARTIDAS SET ESTADO = ${estado} WHERE ID_PARTIDA = ${bodyJson.idPartida}`;
    // console.log(query);
    await bbdd.fetchData(query);

    respuesta.code = 'OK';
}

//metodo del jugador para obtener datos de la partida que esta antes de que esta sea privatizada
async function consultarObtenerPartida(params, respuesta) {
    // console.log('entra en SERVER-partida.consultarObtenerPartida ', params);

    // // // console.log('entra en SERVER-partida.consultarPartidasPublicadas ');
    let partidaResult = await obtenerPartida(params.consultarObtenerPartida);

    if (partidaResult != null) {
        //hay que montar el elemento partida:
        let partida = {
            id: partidaResult.ID_PARTIDA,
            nombre: partidaResult.NOMBRE,
            personajes: partidaResult.JUGADORES,
            // personajesActuales: [],
            // pnjs: [],
            // pnjsEscena: [],
            // equipoCustom: [],
            fechaCreacion: partidaResult.FECHA_CREACION,
            ultimaPartida: partidaResult.FECHA_ULTIMA,
            notas: partidaResult.DESCRIPCION,
            juego: partidaResult.JUEGO,
            publica: partidaResult.ESTADO
        };
        respuesta.code = 'OK';
        respuesta.partida = partida;
    }
    // console.log(respuesta);
}

//metodo del dj para solicitar un check a un jugador
async function solicitarCheck(bodyJson, respuesta) {

    let solicitud = {
        difSel: bodyJson.difSel,
        habSel: bodyJson.habSel
    };
    solicitud = JSON.stringify(solicitud);
    let query = `INSERT INTO SOLICITUDES (ID_PARTIDA, ID_JUGADOR, SOLICITUD,ESTADO, CONTADOR) VALUES (${bodyJson.idPartida},${bodyJson.pjSel},'${solicitud}','CHECK', ${bodyJson.contador})`;
    await bbdd.fetchData(query);
    respuesta.code = 'OK';
}

//metodo del jugador para saber si hay alguna solicitud checks para el
async function consultarChecksPendientes(params, respuesta) {
    // console.log('entra en SERVER-partida.consultarChecksPendientes ', params);
    let filas = await bbdd.fetchData(`SELECT SOLICITUD FROM SOLICITUDES WHERE ID_PARTIDA =${params.idPartida} AND ESTADO = 'PETICION'`);

    for (const key in filas) {
        if (Object.hasOwnProperty.call(filas, key)) {
            const element = filas[key];
            // // console.log(element.RESPUESTA);
            respuesta.code = 'OK';
            respuesta.checks = element.SOLICITUD;
            // respuesta.pjs = element.RESPUESTA;
        }
    }
}

async function aceptarCheck(bodyJson, respuesta) {
    console.log('entra en SERVER-partida.aceptarCheck ', bodyJson);
    let mensaje = JSON.stringify(bodyJson.RESPUESTA);
    let query = `UPDATE SOLICITUDES SET RESPUESTA = '${mensaje}', ESTADO = 'ACEPTADO' WHERE ID_PARTIDA =${bodyJson.ID_PARTIDA} AND ID_JUGADOR =  '${bodyJson.ID_JUGADOR}' AND ESTADO = 'CHECK'`;

    await bbdd.fetchData(query);
    respuesta.code = 'OK';

}

//metodo del master para saber si hay alguna solicitud checks aceptada
async function consultarChecksAceptados(params, respuesta) {
    // console.log('entra en SERVER-partida.consultarChecksAceptados ', params);


    let filas = await bbdd.fetchData(`SELECT * FROM SOLICITUDES WHERE ID_PARTIDA =${params.consultarChecksAceptados} AND ESTADO = 'ACEPTADO'`);

    filas.map(fila => {
        //    console.log(fila);
        respuesta.code = 'OK';
        respuesta.checks = fila;
        let query = `UPDATE SOLICITUDES SET ESTADO = 'CERRADO' WHERE ID_PARTIDA =${params.consultarChecksAceptados} AND ID_JUGADOR =  '${fila.ID_JUGADOR}' AND ESTADO = 'ACEPTADO'`;
        bbdd.fetchData(query);
    });
}

async function publicarResultado(bodyJson, respuesta) {
    console.log('entra en SERVER-partida.publicarResultado ', bodyJson);
    let pj = bodyJson.pjSel;
    if (pj == undefined) {
        pj = JSON.stringify(bodyJson.SOLICITUD);
    }
    if (pj == undefined)
        pj = null;
    let query = `INSERT INTO SOLICITUDES (ID_PARTIDA, ID_JUGADOR, CONTADOR, SOLICITUD, RESPUESTA, ESTADO) VALUES (${bodyJson.ID_PARTIDA},'${bodyJson.ID_JUGADOR}',${bodyJson.CONTADOR},'${pj}','${bodyJson.RESPUESTA}','${bodyJson.ESTATUS}')`;
    await bbdd.fetchData(query);
    respuesta.code = 'OK';

}

async function solicitudAplicarEfecto(bodyJson, respuesta) {
    console.log('entra en SERVER-partida.solicitudAplicarEfecto ', bodyJson);
    publicarResultado(bodyJson, respuesta);
}

//esto quiere unificar todas las consultas del jugador en una
async function consultasParaJugador(params, respuesta) {

    let filas = await bbdd.fetchData(`SELECT * FROM SOLICITUDES WHERE ID_PARTIDA =${params.idPartida} AND (
        (ID_JUGADOR = '${params.consultasParaJugador}' AND ESTADO = 'CHECK') OR
        (CONTADOR >= ${params.consultarResultadoPublicado} AND ESTADO = 'HISTORICO' )
    )`);
    respuesta.checks = [];
    for (const key in filas) {
        respuesta.code = 'OK';
        if (Object.hasOwnProperty.call(filas, key)) {
            const element = filas[key];
            respuesta.checks.push(element);
        }
    }

}
async function solicitarDuelo(bodyJson, respuesta) {
    console.log('entra en SERVER-partida.solicitarDuelo ', bodyJson);
    let query = `INSERT INTO SOLICITUDES (ID_PARTIDA, ID_JUGADOR, SOLICITUD,ESTADO, CONTADOR) VALUES (${bodyJson.idPartida},${bodyJson.pjSel},'DUELO','CHECK', ${bodyJson.contador})`;
    await bbdd.fetchData(query);
    respuesta.code = 'OK';
}

async function solicitarTiradas(bodyJson, respuesta) {
    console.log('entra en SERVER-partida.solicitarTiradas ', bodyJson);
    // let query = `INSERT INTO SOLICITUDES (ID_PARTIDA, ID_JUGADOR, SOLICITUD,ESTADO, CONTADOR) VALUES (${bodyJson.idPartida},${bodyJson.pjSel},'DUELO','CHECK', ${bodyJson.contador})`;
    // await bbdd.fetchData(query);

    let tiradas = [];
    for (let i = 0; i < bodyJson.numDados; i++) {
        tiradas[i] = tirada();
    }
    tiradas = ordenarMayorMenor(tiradas);
    const resultado = {
        ID_PARTIDA: bodyJson.ID_PARTIDA,
        ID_JUGADOR: bodyJson.ID_JUGADOR,
        CONTADOR: bodyJson.CONTADOR,
        pjSel: bodyJson.pjSel,
        RESPUESTA: `<td>${bodyJson.pjSel}</td><td>Ha realizado una tirada de dados con resultado: <b>${tiradas}</b></td>`,
        ESTATUS: "HISTORICO"
    };

    publicarResultado(resultado, respuesta);

    respuesta.code = 'OK';
    respuesta.resultado = resultado;
}
//tirada de dado de 10 caras
function tirada() {
    return Math.floor((Math.random() * (10)) + 1);
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
/**metodo del jugador para saber si su ultima partida sigue en activo
async function consultarPartidaActiva(params, respuesta) {

    let partida = PARTIDAS[params.consultarPartidaActiva];
    if (partida != undefined) {
        respuesta.code = 'OK';
    } else {
        respuesta.code = 'KO';
    }
}
*/
// function testeos(valor){
//     let result;

//     if(valor === undefined || valor === null){
//         valor=result;
//     }else{
//         valor="otro valor";
//     }
//     valor = "otro valor" ?? result;
// }
/** NOTAS
 * 'nullish coalescing' is only available in ES11
 * function testeos(valor){
    let result;

    if(valor === undefined || valor === null){
        valor=result;
    }

    valor ??= result;
}


function testeos(valor){
    let result;

    if(valor === undefined || valor === null){
        valor=result;
    }else{
        valor="otro valor";
    }
    valor = "otro valor" ?? result;
}
 */

exports.start = start;