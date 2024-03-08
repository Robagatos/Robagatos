/*jshint esversion: 8 */

let start = async(params, bodyJson) => {
    console.log("entra en start Comments ", bodyJson);
    let respuesta = {
        code: 'KO'
    };
    let bbdd = require("../../../bbdd.js");
    try {
        await bbdd.registrarComentario(bodyJson.mail, bodyJson.comentario);
        respuesta.code = "OK";
    } catch (exception) {
        console.log(exception);
    }


    let respuestaLiteral = JSON.stringify(respuesta);

    console.log("sale de start en Comments ", respuestaLiteral);
    return respuestaLiteral;
};

exports.start = start;