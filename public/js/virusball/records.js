/*jshint esversion: 8 */

const getRecordDiario = "SELECT NOMBRE, PUNTOS, FECHA FROM RECORDS WHERE ID='recordHoy' ";
const getRecordMensual = "SELECT NOMBRE, PUNTOS, FECHA FROM RECORDS WHERE ID='recordMes' ";
const getRecordMasGrande = "SELECT NOMBRE, PUNTOS FROM RECORDS WHERE ID='recordMax' ";

let start = async(params) => {

    let respuesta = {
        code: 'KO'
    };
    let bbdd = require("../../../bbdd.js");
    if (params.getRecords != undefined) {
        // console.log("Entra en getRecords");
        try {

            let desgranarDatos = (datos) => {
                let almacen = {};
                almacen.nombre = datos[0].NOMBRE;
                almacen.puntos = datos[0].PUNTOS;
                return almacen;
            };
            const fecha = new Date();
            const hoy = fecha.getDate();
            const mes = fecha.getMonth();
            let filas = await bbdd.fetchData(getRecordDiario);
            // // console.log(filas[0].FECHA.getDate(), " ", filas[0].FECHA.getMonth())
            if (filas[0].FECHA.getDate() == hoy && filas[0].FECHA.getMonth() == mes) {
                // console.log("mismo dia");
            } else {
                const setRecordDiario = `UPDATE RECORDS SET NOMBRE='???', PUNTOS=0, FECHA= SYSDATE() WHERE ID='recordHoy' `;
                await bbdd.fetchData(setRecordDiario);
                filas[0].NOMBRE = '???';
                filas[0].PUNTOS = 0;
            }

            respuesta.recordHoy = desgranarDatos(filas);

            filas = await bbdd.fetchData(getRecordMensual);

            if (filas[0].FECHA.getMonth() == mes) {
                // console.log("mismo mes");
            } else {
                const setRecordMensual = `UPDATE RECORDS SET NOMBRE='???', PUNTOS=0, FECHA= SYSDATE()WHERE ID='recordMes' `;
                await bbdd.fetchData(setRecordMensual);
                filas[0].NOMBRE = '???';
                filas[0].PUNTOS = 0;
            }
            respuesta.recordMes = desgranarDatos(filas);

            filas = await bbdd.fetchData(getRecordMasGrande);
            respuesta.recordBest = desgranarDatos(filas);

            respuesta.code = 'OK';
        } catch (exception) {
            return exception.message;
        }

        // publicarPartida(bodyJson, respuesta);
    } else if (params.saveRecord != undefined) {
        // consultarPartidasPublicadas(bodyJson, respuesta);
        // console.log("Entra en saveRecord ", params.saveRecord, params.puntos);
        respuesta.code = 'OK';
        try {

            let desgranarDatos = (datos) => {
                let almacen = {};
                almacen.nombre = datos[0].NOMBRE;
                almacen.puntos = datos[0].PUNTOS;
                return almacen;
            };

            let filas = await bbdd.fetchData(getRecordDiario);
            respuesta.recordHoy = desgranarDatos(filas);

            filas = await bbdd.fetchData(getRecordMasGrande);
            respuesta.recordBest = desgranarDatos(filas);

            filas = await bbdd.fetchData(getRecordMensual);
            respuesta.recordMes = desgranarDatos(filas);

            if (params.puntos > respuesta.recordBest.puntos) {
                // console.log("recordBest");
                const setRecordMasGrande = `UPDATE RECORDS SET NOMBRE='${params.saveRecord}', PUNTOS=${params.puntos}, FECHA= SYSDATE() WHERE ID='recordMax' `;
                await bbdd.fetchData(setRecordMasGrande);
            }
            if (params.puntos > respuesta.recordMes.puntos) {
                // console.log("recordMes");
                const setRecordMensual = `UPDATE RECORDS SET NOMBRE='${params.saveRecord}', PUNTOS=${params.puntos}, FECHA= SYSDATE()WHERE ID='recordMes' `;
                await bbdd.fetchData(setRecordMensual);
            }
            if (params.puntos > respuesta.recordHoy.puntos) {
                // console.log("recordHoy");
                const setRecordDiario = `UPDATE RECORDS SET NOMBRE='${params.saveRecord}', PUNTOS=${params.puntos}, FECHA= SYSDATE() WHERE ID='recordHoy' `;
                await bbdd.fetchData(setRecordDiario);
            }

            respuesta.code = 'OK';
        } catch (exception) {
            return exception.message;
        }
    } else if (params.visita != undefined) {
        // console.log(params);
        await bbdd.registrarVisita(params.visita);
        respuesta.code = 'OK';
    }


    let respuestaLiteral = JSON.stringify(respuesta);

    // console.log("sale de consultar en records");
    return respuestaLiteral;
};


let startPost = async(params, bodyJson) => {

    let respuesta = {
        code: 'KO'
    };
    let bbdd = require("../../../bbdd.js");
    try {
        await bbdd.registrarComentario(bodyJson.mail, bodyJson.comentario);
        respuesta.code = "OK";
    } catch (exception) {
        // console.log(exception);
    }


    let respuestaLiteral = JSON.stringify(respuesta);

    // console.log("sale de startPost en records ", respuestaLiteral);
    return respuestaLiteral;
};



exports.startPost = startPost;
exports.start = start;