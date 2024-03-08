/*jshint esversion: 8 */

const mariadb = require('mariadb');

const conecta = mariadb.createPool({
    host: 'localhost',
    user: 'robagatos',
    password: 'pimpumpam%01',
    database: 'rolinapp_bbdd',
    port: '3306'
});

const fetchData = async(query) => {

    let conecction;
    try {
        conecction = await conecta.getConnection();
        const filas = await conecction.query(query);
        return filas;
    } catch (err) {
        console.log(err);
        return err.message;
    } finally {
        conecction.close();
    }
};

const registrarVisita = async(visita) => {
    let hoy = new Date();
    let query = `SELECT * FROM VISITAS WHERE DATE(FECHA)='${hoy.getFullYear()}-${hoy.getMonth()+1}-${hoy.getDate()}'`;
    // // console.log(query);
    let filas = await fetchData(query);

    if (filas.length == 0) {
        // // console.log("hay que hacer un insert");
        fetchData(`INSERT INTO VISITAS (ACCESOS, URL,FECHA) VALUES (1, '${visita}', SYSDATE())`);
    } else {
        // // console.log("hay que hacer un update");
        fetchData(`UPDATE VISITAS SET ACCESOS = ${filas[0].ACCESOS+1} WHERE ID = ${filas[0].ID}`);
    }
};

const registrarComentario = async(mail, comentario) => {
    if (mail.length > 49)
        mail = mail.substring(0, 49);
    if (comentario.length > 499)
        comentario = comentario.substring(0, 499);
    await fetchData(`INSERT INTO COMMENTS (MAIL, COMENTARIO,FECHA) VALUES ('${mail}', '${comentario}', SYSDATE())`);
};

exports.registrarComentario = registrarComentario;
exports.registrarVisita = registrarVisita;
exports.fetchData = fetchData;