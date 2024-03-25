/*jshint esversion: 6 */
//aqui voy a poner todas las variables, y carga de pantallas, y todo lo comun

requestAnimFrame = (function() {
    animFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback) { window.setTimeout(callback, 1000 / 60); };

    return animFrame;

})();
var hiloLibre = true;
var start = null;

function init() {
    console.log("iniciando");
    //recurso canvas 2d y buffer
    // recogemos los param
    const valores = window.location.search;
    const urlParams = new URLSearchParams(valores);
    var debugParam = urlParams.get('debug');
    if (debugParam != undefined) {
        debug = true;
    }
    canvasInit();

    cambiarPantalla(Object.create(PantallaCarga));

    function anim(timestamp) {

        let progress = Math.floor(timestamp - start);

        if (progress > 15) {
            start = timestamp;
            try {
                update();
            } catch (error) {
                console.log(error);
                debug = true;
                animFrame = error;
            }
            try {
                draw();
            } catch (error) {
                console.log(error);
                debug = true;
                animFrame = error;
            }



            let fps = Math.round(1000 / (new Date().getMilliseconds() - timeEnds));
            fpsArray.push(fps);

            let fpsMaxima = Math.max(...fpsArray);
            let fpsMinima = Math.min(...fpsArray);


            timeConts = (fpsMaxima + fpsMinima) / 2 + " :: " + progress;

            if (fpsArray.length > 100) {
                fpsArray.shift();
            }


            timeEnds = new Date().getMilliseconds();
        }
        requestAnimFrame(anim);
    }

    anim();
}


function canvasInit() {
    canvas = document.getElementById("canvas");
    /** @type {CanvasRenderingContext2D} */
    ctx = canvas.getContext("2d");

    buffer = document.createElement('canvas');
    buffer.width = canvas.width;
    buffer.height = canvas.height;
    bufferctx = buffer.getContext('2d');
    // bufferctx.shadowColor = "black";
    // bufferctx.shadowBlur = 6;
    // bufferctx.shadowOffsetX = 3;
    // bufferctx.shadowOffsetY = 3;
    //eventos click
    canvas.addEventListener("mouseup", function(evt) {
            let mousePos = oMousePos(canvas, evt);
            pantallaActual.mouseup(mousePos);
        },
        false

    );
    canvas.addEventListener('touchstart', function(event) {
        // console.log('touchstart');
        event.preventDefault();
        // Comprobamos si hay varios eventos del mismo tipo
        if (event.targetTouches.length == 1) {
            let touch = event.targetTouches[0];
            let mousePos = oMousePos(canvas, touch);
            pantallaActual.mouseup(mousePos);
        }
    }, false);

}

function aplicarSombras() {
    bufferctx.save();
    bufferctx.shadowColor = "black";
    bufferctx.shadowBlur = 6;
    bufferctx.shadowOffsetX = 3;
    bufferctx.shadowOffsetY = 3;
}

function youWin() {

    nivel++;
    if (nivel > 5) {
        pantalla++;
        nivel = 1;
    }


    cambiarPantalla(new PantallaPartida());
}

function reiniciar() {
    nivel = 1;
    pantalla = 1;
    puntuacion = 0;

    cambiarPantalla(new PantallaPartida());
}

function gameOver() {

    if (puntuacion > recordMax || puntuacion > recordMes || puntuacion > recordHoy) {
        const alertPlaceholder = document.getElementById('liveAlertPlaceholder');

        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-success alert-dismissible fade show" style="width:600px"role="alert">
                <h4 class="alert-heading">¡Bravo!</h4>
                <p>¡Has conseguido una buena puntuacion! Si quieres salvar tu hazaña, introduce tu apodo.</p>
                <hr>
                <div class="d-flex justify-content-center input-group mb-3">
                    <input id="alias" type="text" class="form-control" placeholder="Alias" aria-label="Alias" aria-describedby="button-addon2" maxlength="12">
                    <button class="btn btn-outline-secondary" type="button" id="button-addon2" data-bs-dismiss="alert" onclick="salvarRecords()" >Enviar</button>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" onclick="reiniciar()" aria-label="Close"></button>
              </div>`
        ].join('');
        alertPlaceholder.append(wrapper);

    } else {
        reiniciar();
    }
}

function salvarRecords() {
    let nombre = document.getElementById('alias').value;
    if (nombre != "") {
        let promise = new Promise((resolve, reject) => {
            let request = llamadaServer(`records?saveRecord=${nombre}&puntos=${puntuacion}`);
            request.onload = function() {
                let respuesta = request.response;
                console.log("2- consultar: respuesta " + respuesta.code);
                if (respuesta.code == 'OK') {
                    resolve(respuesta);
                } else {
                    notOK();
                }
            };
        });
        promise.then((respuesta) => {
            let mensaje = (nombre, puntos) => {
                return `${nombre} con ${puntos} puntos`;
            };
            //record hoy
            if (respuesta.recordHoy.nombre != undefined) {
                document.getElementById('recordHoy').innerText = mensaje(respuesta.recordHoy.nombre, respuesta.recordHoy.puntos);
                recordHoy = respuesta.recordHoy.puntos;
            }
            //record mes
            if (respuesta.recordMes.nombre != undefined) {
                document.getElementById('recordMes').innerText = mensaje(respuesta.recordMes.nombre, respuesta.recordMes.puntos);
                recordMes = respuesta.recordMes.puntos;
            }
            //record max
            if (respuesta.recordBest.nombre != undefined) {
                document.getElementById('recordBest').innerText = mensaje(respuesta.recordBest.nombre, respuesta.recordBest.puntos);
                recordMax = respuesta.recordBest.puntos;
            }
            reiniciar();
        });
    } else {
        reiniciar();
    }

}

function cambiarPantalla(nuevaPantalla) {
    pantallaActual = nuevaPantalla;
    pantallaActual.init();
}

function update() {
    pantallaActual.update();
}

// update
function draw() {
    pantallaActual.draw();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buffer, 0, 0);
    ctx.font = "12px Arial";
    ctx.fillStyle = "green";
    ctx.textAlign = "right";
    ctx.fillText("v." + VERSION, 595, 10);

    if (debug) {
        ctx.fillText(animFrame, 595, 795);
        ctx.textAlign = "left";
        ctx.fillText("FPS: " + timeConts, 5, 795);
    }


}
//clicks
function oMousePos(canvas, evt) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: Math.round(evt.clientX - rect.left),
        y: Math.round(evt.clientY - rect.top),
    };
}

function colision(entx, enty, entidad2) {
    let xPuntoA = entidad2.x + minTamColision;
    let yPuntoA = entidad2.y + minTamColision;
    let xPuntoD = entidad2.x + (entidad2.tam - minTamColision);
    let yPuntoD = entidad2.y + (entidad2.tam - minTamColision);
    return (
        entx > xPuntoA &&
        entx < xPuntoD &&
        enty > yPuntoA &&
        enty < yPuntoD
    );
}

function nuevoColor() {
    let color = tirada(nivel + 2);
    let colorLiteral = bolas[color];
    return colorLiteral;
}

function tirada(max) {
    return Math.floor((Math.random() * (max)));
}

//TEXTOS FIJOS
//los textos flotantes son considerados sprites



function printText(texto, x, y, color = "rgba(0, 0, 0, 1)", tam = 30, align = "center", stroke = false, sombras = true) {
    bufferctx.font = tam + "px Fuzzy Bubbles";
    bufferctx.textAlign = align;
    if (sombras) {
        bufferctx.save();
        bufferctx.shadowBlur = 15;
        bufferctx.shadowColor = "black";
    }

    if (stroke) {
        bufferctx.strokeStyle = color;
        bufferctx.strokeText(texto, x, y);
    } else {
        bufferctx.fillStyle = color;
        bufferctx.fillText(texto, x, y);
    }
    if (sombras) {
        bufferctx.restore();
    }
}

function enviarComentario() {

    let mensaje = {
        mail: document.getElementById('mail').value,
        comentario: document.getElementById('comentario').value
    };
    // console.log(mensaje);
    if (mensaje.comentario == "") {
        alert("El comentario no puede estar vacío.");
    } else {
        document.getElementById('comentarios').style = "display: none;";
        let promise = new Promise((resolve, reject) => {
            let request = llamadaServer("comments", mensaje);
            request.onload = function() {
                let respuesta = request.response;
                console.log("2- consultar: respuesta " + respuesta.code);
                if (respuesta.code == 'OK') {
                    resolve(respuesta);
                } else {
                    reject();
                }
            };
        });
        promise.then((respuesta) => {
            document.getElementById('comentarioEnviado').style = "display: block;";
        });
        promise.catch(() => {
            alert("Error en el envío del comentario");
        });

    }


}

function llamadaServer(url, mensaje) {
    let protocol = window.location.protocol;
    let host = window.location.host;
    let requestURL = protocol + '//' + host + '/virusball/' + url;
    let request = new XMLHttpRequest();
    request.responseType = "json";
    if (mensaje != undefined || mensaje != null) {
        console.log("POST");
        request.open("POST", requestURL);
        request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        request.send(JSON.stringify(mensaje));
    } else {
        console.log("GET");
        request.open('GET', requestURL, true);
        request.send();
    }

    return request;
}

window.onload = function() {
    init();

};