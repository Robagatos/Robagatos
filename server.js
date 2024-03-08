/*jshint esversion: 8 */
//const http = require('http');
//const fs = require('fs'); // sistema de archivo
const path = require("path"); // path
const express = require("express");
const bodyParser = require("body-parser");
var favicon = require('serve-favicon');
const bbdd = require("./bbdd.js");
const PORT = process.env.PORT || 3000;


function start() {

    const server = express();
    server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    server.use(express.static(path.join(__dirname, "public")));
    server.use(bodyParser.json());
    server.set("views", path.join(__dirname, "views"));
    server.set("view engine", "ejs");

    //gets
    server.get("/", (req, res) => {
        res.render("rolinapp/rolinapp");
    });

    server.get("/codetest", (req, res) => {
        res.render("nuri/codetest");
    });
    server.get("/musculs", (req, res) => {
        res.render("nuri/musculs");
    });
    server.get("/ossos", (req, res) => {
        res.render("nuri/ossos");
    });
    server.get("/jcc", (req, res) => {
        res.render("jcc/jcc");
    });
    server.get("/jcc-pc", (req, res) => {
        res.render("jcc/jcc-pc");
    });
    server.get("/jcc-mobile", (req, res) => {
        res.render("jcc/jcc-mobile");
    });

    // About page route

    server.post("/rolinapp/p", function(req, res) {
        ejecutarRolInAppActionPOST(req.query, req.body, res);
    });
    server.get("/rolinapp/p", function(req, res) {
        ejecutarRolInAppAction(req.query, res);
    });
    server.post("/virusball/comments", function(req, res) {
        virusBallRecordsPOST(req.query, req.body, res);
    });
    server.get("/virusball/records", function(req, res) {
        virusBallRecords(req.query, res);
    });
    //

    server.get("/virusball", (req, res) => res.render("virusball/virusball"));
    server.get("/rolinapp", (req, res) => res.render("rolinapp/rolinapp"));
    server.get("/rolinapp/jugador", (req, res) => res.render("rolinapp/jugador/jugador"));
    server.get("/rolinapp/personaje", (req, res) => res.render("rolinapp/jugador/personaje"));
    server.get("/rolinapp/galeriaPersonajes", (req, res) => res.render("rolinapp/jugador/galeriaPersonajes"));
    server.get("/rolinapp/director", (req, res) => res.render("rolinapp/director/director"));
    server.get("/rolinapp/partidaDirectorFW", (req, res) => res.render("rolinapp/director/partidaDirectorFW"));
    server.get("/rolinapp/reglas", (req, res) => res.render("rolinapp/reglas/reglas"));
    server.get("/rolinapp/lore", (req, res) => res.render("rolinapp/lore/lore"));
    server.get("/rolinapp/partida", (req, res) => res.render("rolinapp/jugador/partida"));
    server.listen(PORT, () => console.log(`Listening on ${PORT}`));

}

async function virusBallRecords(params, response) {
    // console.log("virusBallRecords");
    let accion = require("./public/js/virusball/records.js");
    let content = {};
    try {
        content = await accion.start(params);
    } catch (exception) {
        content.code = "KO";
        content.error = exception;
        content = JSON.stringify(content);
        persistExceptionBBDD(exception);
    }
    let contentType = "json";
    response.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "content-Type": contentType,
    });
    response.end(content);
}

async function virusBallRecordsPOST(params, bodyJson, response) {
    // console.log("virusBallRecordsPOST");
    let accion = require("./public/js/virusball/records.js");
    let content = {};
    try {
        content = await accion.startPost(params, bodyJson);
    } catch (exception) {
        content.code = "KO";
        content.error = exception;
        content = JSON.stringify(content);
        persistExceptionBBDD(exception);
    }
    let contentType = "json";
    response.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "content-Type": contentType,
    });
    response.end(content);
}

async function ejecutarRolInAppAction(params, response) {

    let accion = require("./public/js/rolinapp/" + params.reqCode + ".js");
    let content = {};
    try {
        content = await accion.start(params);
    } catch (exception) {
        content.code = "KO";
        content.error = exception;
        content = JSON.stringify(content);
        persistExceptionBBDD(exception);
    }
    let contentType = "json";
    response.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "content-Type": contentType,
    });
    response.end(content);

}

async function ejecutarRolInAppActionPOST(params, bodyJson, response) {

    let accion = require("./public/js/rolinapp/" + params.reqCode + ".js");
    let content = {};
    try {
        content = await accion.start(params, bodyJson);
    } catch (exception) {
        content.code = "KO";
        content.error = exception;
        content = JSON.stringify(content);
        persistExceptionBBDD(exception);
    }
    let contentType = "json";
    response.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "content-Type": contentType,
    });
    response.end(content);

}

function persistExceptionBBDD(exception) {
    let query = `INSERT INTO EXCEPCIONES (FECHA, ERROR) VALUES ( NOW(), ${exception})`;
    bbdd.fetchData(query);
}

exports.start = start;