/*jshint esversion: 8 */

const PantallaCarga = {

    elementoTexto: "valor",
    lastMousePos: null,
    contadorEntidades: 0,
    posicionesImagenes: [],
    opacidad: 1,
    contadorParpadeo: 0,
    contador: 0,
    pintarVirus: true,
    init() {
        // bufferctx.fillStyle = "black";
        // const rectangle = new Path2D();
        // rectangle.rect(0, 0, canvas.width, canvas.height);
        // bufferctx.fill(rectangle);
        let canvasCentreX = canvas.width / 2;
        let canvasCentreY = (canvas.height / 3);
        let gradient = ctx.createRadialGradient(canvasCentreX, canvasCentreY, 250, canvasCentreX, canvasCentreY, 0);
        gradient.addColorStop(0, "rgb(0, 0, 0)");
        gradient.addColorStop(1, "red"); //"rgb(125, 125, 125)");
        bufferctx.save();
        bufferctx.fillStyle = gradient;
        bufferctx.fillRect(0, 0, canvas.width, canvas.height);
        bufferctx.restore();
        cargarImagenes(0);
        this.visita();
    },

    update() {

        if (imagenes[imagenesLiterales[this.contadorEntidades]] != undefined && !todoCargado) {
            bufferctx.drawImage(imagenes[imagenesLiterales[this.contadorEntidades]], Math.round(Math.random() * canvas.width), Math.round(Math.random() * canvas.height));
            this.contadorEntidades++;
        }
        if (this.contadorEntidades > 5) { this.contadorEntidades = 0; }
        this.contador++;
        if (this.contador == 5) {
            if (this.contadorParpadeo == 0)
                this.opacidad -= 0.1;
            else this.opacidad += 0.1;


            if (this.opacidad < 0.5) {
                this.contadorParpadeo = 1;
            }
            if (this.opacidad >= 1) {
                this.contadorParpadeo = 0;
            }
            this.opacidad = Number(this.opacidad.toFixed(2));

            this.contador = 0;
        }

    },

    draw() {
        aplicarSombras();
        printText(VIRUS, 300, 300, "blue", 100, "center", false, false);
        printText(BALL, 300, 400, "red", 100, "center", false, false);
        printText(VIRUS, 300, 300, "cyan", 100, "center", true, false);
        printText(BALL, 300, 400, "white", 100, "center", true, false);
        bufferctx.fillStyle = "black";
        const rectangle = new Path2D();
        rectangle.rect(0, 700, canvas.width, canvas.height);
        bufferctx.fill(rectangle);
        printText(CARGANDO, 150, 750, "gold", 30, "center", false, false);
        printText(this.elementoTexto, 450, 750, "white", 30, "center", false, false);

        if (todoCargado) {
            bufferctx.fillStyle = "black";
            const rectangle = new Path2D();
            rectangle.rect(120, 420, 350, 40);
            bufferctx.fill(rectangle);
            printText(PULSA, 300, 450, "rgba(255,255,255," + this.opacidad + ")", 30, "center", false, false);
            this.imgX = 1;
            this.imgY = 1;
            this.imgAncho = 99;
            this.imgAlto = 99;
            if (this.pintarVirus) {
                bufferctx.drawImage(imagenes["virusgordo"], 1, 1, 99, 99, 100, 100, 100, 100);
                bufferctx.drawImage(imagenes["virusgordo_flip"], 1, 1, 99, 99, 200, 500, 100, 100);
                bufferctx.drawImage(imagenes["virusgordo"], 100, 1, 99, 99, 450, 300, 100, 100);
                bufferctx.drawImage(imagenes["virusgordo"], 200, 1, 99, 99, 500, 600, 100, 100);
                bufferctx.drawImage(imagenes["virusgordo_flip"], 300, 1, 99, 99, 50, 400, 100, 100);
                bufferctx.drawImage(imagenes["virusgordo_flip"], 200, 1, 99, 99, 400, 50, 100, 100);
                this.pintarVirus = false;
            }

        }
        bufferctx.restore();
    },

    visita() {
        let promise = new Promise((resolve, reject) => {
            let request = llamadaServer("records?visita=virusball");
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
            console.log(respuesta);
        });
    },
    mouseup(mousePos) {
        if (todoCargado) cambiarPantalla(new PantallaPartida());
    }
};


function cargarRecords() {
    // console.log("1- consultar " + url);
    let promise = new Promise((resolve, reject) => {
        let request = llamadaServer("records?getRecords");
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
        console.log(respuesta);
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
    });
}

/* Pantalla partida */
class PantallaPartida {
    constructor() {
        this.textos = [];
        this.entidades = [];
        this.bolasParadas = [];
        this.entidadesDestruir = [];
        this.bolasLanzadas = [];
        this.infeccion = 10 + pantalla;
        this.bolaActual = null;
        this.bolaSiguiente = null;
        this.isPuedeLanzarBola = true;
        this.pantallaNivel = "";
        this.contadorInfeccion = 0;
        this.gameover = false;
        this.contadorFinJuego = 0;
        this.virusVencedor = null;
        this.youWin = false;
        this.cuentaInicial = true;
        this.conteoInicial = 3;
        this.contadorInicial = 150;
        this.ultimaBolaLanzada = null;
        this.contadorIdBolas = 0;

        this.posicionesXBolaParada = [25, 0, 525, 550];
        this.posicionesYBolaParada = [90, 130, 90, 130];
        this.lastXNuevaBola = [];
        this.contadorCicloCambioBola = 0;
        this.aDestruir = new Set();
        // this.pasoMasPesado = "";
        // this.tiempoPesado = 0;
        this.reEvaluarColisiones = true;
        this.idInterval = 0;
    }
    init() {
        console.log("init pantallaPartida");
        cargarRecords();
        // hay que poner el fondo segun nivel, poner las bolas iniciales segun nivel
        this.nuevasBolas();
        this.pantallaNivel = pantalla + " - " + nivel;

        let posicionesXBolaParadaColor = [
            100, 150, 200, 250, 300, 350, 400,
            200, 250, 300, 350,
            275
        ];
        let posicionesYBolaParadaColor = [
            100, 100, 100, 100, 100, 100, 100,
            150, 150, 150, 150,
            175
        ];

        //bolas color
        for (let i = 0; i < posicionesXBolaParadaColor.length; i++) {
            let bolaColor = this.nuevaBola(posicionesXBolaParadaColor[i], posicionesYBolaParadaColor[i]);
            bolaColor.pararBola();
            bolaColor.colocarBola();
            bolaColor.moverse = true;
        }
        //carga de virus por nivel
        let infection = 3 + nivel;
        const infeccionInicial = () => {
            this.entidades.push(createVirus(nuevoColor(), Math.floor((Math.random() * 400)) + 50, 100));
            if (infection > 0) {
                infection--;
                setTimeout(() => { infeccionInicial(); }, 500);
            }
        };
        setTimeout(() => { infeccionInicial(); }, 500);
        if (nivel == 5) {
            this.entidades.push(new Boss());
        }

        for (let i = 0; i < pantalla + nivel; i++) {
            this.crearBolaParadaFlotante();
        }

    }

    mouseup(mousePos) {

        if (!this.cuentaInicial) {
            if (this.isPuedeLanzarBola && (mousePos.y < bolaGrandeStartY + (this.bolaActual.tam / 2))) {

                this.isPuedeLanzarBola = false;
                //lanzamos la bola,  
                this.lastMousePos = mousePos;

                let deltaX = mousePos.x - (bolaGrandeStartX + 25);
                let deltaY = mousePos.y - (bolaGrandeStartY + 25);
                let distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                let distanceX = speed * deltaX / distance;
                let distanceY = speed * deltaY / distance;

                let nuevaBola = this.nuevaBolaDeBola(this.bolaActual, distanceX, distanceY);
                this.bolasLanzadas.push(nuevaBola);
                //actualizamos la bola actual con la siguiente bola, calculamos la siguiente bola, 
                this.bolaActual.color = this.bolaSiguiente.color;
                this.bolaSiguiente.color = nuevoColor();
                setTimeout(() => {
                    this.isPuedeLanzarBola = true;
                }, 500);

            }
            if (mousePos.y > bolaGrandeStartY + (this.bolaActual.tam)) {
                //actualizamos la bola actual con la siguiente bola, calculamos la siguiente bola, 

                let maxLevel = nivel + 1;
                if (maxLevel > 5) maxLevel = 5;
                let newColor = imagenesLiterales[this.contadorCicloCambioBola];
                this.contadorCicloCambioBola++;
                if (this.contadorCicloCambioBola > maxLevel) this.contadorCicloCambioBola = 0;

                this.bolaActual.color = this.bolaSiguiente.color;
                this.bolaSiguiente.color = newColor;
                this.textos.push(new Texto("SWAP!", 300, bolaGrandeStartY, "white"));
            }
        }

    }

    update() {
        if (this.cuentaInicial) { this.realizarCuentaInicial(); } else {
            //INFECCION!
            let calcularFin = !this.comprobarFinJuego();
            if (calcularFin) {
                //movemos las bolas lanzadas:
                let resultadoComprobarColision = this.comprobarBolaDisparada();
                this.aDestruir.clear();
                if (resultadoComprobarColision != null) this.comprobarColisionBolasParadas(resultadoComprobarColision);

                //entidades en destruccion
                this.comprobarDestruccionEntidades();
                // mover las bolas paradas
                this.bolasParadas.forEach((bolaParada1) => {
                    bolaParada1.update();
                });

                this.entidades.forEach((entidad) => {
                    entidad.update();
                });
                this.comprobarNuevoVirus();
                //textos
                this.textos.forEach(texto => texto.update());

            }
        }
    }

    comprobarDestruccionEntidades() {
        if (this.aDestruir.size > 0) {
            this.lastXNuevaBola = [];
            this.bolasParadas.forEach(bolaParada1 => {
                bolaParada1.moverse = true;
            });
        }
        for (let bola of this.aDestruir) {
            bola.marcarDestruirBola();
            this.bolasParadas.splice(this.bolasParadas.indexOf(bola), 1);
            this.entidades.push(new Explosion(bola.x, bola.y));
            if (bola.infectada == 0) {
                this.crearBolaParadaFlotante();
            }
            this.puntuar(1, bola.x + bola.tam / 2, bola.y);
        }

        this.entidadesDestruir.forEach((entidad) => {
            let bolaDestruida = entidad.update();
            if (bolaDestruida) {
                let index = this.entidadesDestruir.indexOf(entidad);
                this.entidadesDestruir.splice(index, 1);
                if (entidad.infectada > 0) {
                    this.puntuar(10 * entidad.infectada, entidad.x + entidad.tam / 2, entidad.y);
                    this.infeccion -= entidad.infectada;
                    this.entidades.push(createVirus(nuevoColor(), Math.floor((Math.random() * 400)) + 50, 0));
                    if (this.infeccion <= 0) {
                        this.infeccion = 0;
                        this.youWin = true;
                    }
                }
            }
        });
    }
    puntuar(puntos, x, y) {
        pantallaActual.textos.push(new Texto(puntos, x, y, "gold"));
        puntuacion += (puntos);
    }
    realizarCuentaInicial() {

        this.contadorInicial -= 2;
        if (this.contadorInicial < 100) {
            this.contadorInicial = 150;
            this.conteoInicial--;

        }
        if (this.conteoInicial == 0) {
            this.conteoInicial = "Go!";

        }
        if (this.conteoInicial == "Go!" && this.contadorInicial < 101) {
            this.cuentaInicial = false;
            this.idInterval = setInterval(this.nuevaBolaGlobuloRosa, 1000);
            this.contadorInicial = 150;
            this.conteoInicial = -2;
        }

    }
    comprobarFinJuego() {
        let finJuego = false;

        if (this.infeccion <= 0) {
            finJuego = true;
            this.entidades.length = 0;
            this.contadorFinJuego += 2;
            if (this.contadorFinJuego > 200) {
                if (this.idInterval != 0)
                    clearInterval(this.idInterval);
                youWin();
            }
        } else if (this.gameover) {
            finJuego = true;
            let newViros = createVirus(this.virusVencedor.color, Math.random() * canvas.width, Math.random() * canvas.height);
            newViros.distanceX = 0;
            newViros.distanceY = 0;
            pantallaActual.entidades.push(newViros);
            this.contadorFinJuego += 2;
            if (this.contadorFinJuego > 200) {
                if (this.idInterval != 0)
                    clearInterval(this.idInterval);
                this.update = () => {};
                gameOver();
            }
        }

        return finJuego;
    }
    comprobarBolaDisparada() {
        let result = null;
        //update de bola disparada
        this.bolasLanzadas.forEach(bolaLanzada => {
            bolaLanzada.update();

            if (bolaLanzada.moverse) {
                let colision = false;
                this.bolasParadas.forEach((ent2) => {
                    if (!ent2.intocable && colision == false) {
                        colision = this.comprobarColision(bolaLanzada, ent2);
                        if (colision) {
                            bolaLanzada.x -= bolaLanzada.distanceX;
                            bolaLanzada.y -= bolaLanzada.distanceY;
                            bolaLanzada.colocarBola();
                            bolaLanzada.pararBolaLanzada();
                            result = bolaLanzada;
                            this.reEvaluarColisiones = true;
                        }
                    }
                });
                //comprobamos colision con virus
                let continuar = !colision;
                this.entidades.forEach((entidad) => {
                    if (entidad.colisionable)
                        if (continuar) {
                            let colision = this.comprobarColision(bolaLanzada, entidad);
                            if (colision) {
                                continuar = false;
                                if (bolaLanzada.color == entidad.color) {
                                    let index = this.entidades.indexOf(entidad);
                                    this.entidades.splice(index, 1);
                                    bolaLanzada.infectarBola(entidad.tam > 45, entidad.escapista);
                                    this.puntuar(5, entidad.x + entidad.tam / 2, entidad.y);
                                } else if (bolaLanzada.infectada == 0) {
                                    this.textos.push(new Texto("WTF!", entidad.x + entidad.tam / 2, entidad.y, "orange"));
                                    this.entidadesDestruir.push(bolaLanzada);
                                    this.bolasLanzadas.splice(this.bolasLanzadas.indexOf(bolaLanzada), 1);
                                    this.entidades.push(new Explosion(bolaLanzada.x, bolaLanzada.y));
                                    bolaLanzada.update = bolaLanzada.updateDestruir;
                                    bolaLanzada.contadorDestruir = 1;
                                    entidad.impactada(bolaLanzada);
                                    this.reEvaluarColisiones = true;
                                }
                            }
                        }
                });
            }
        });

        return result;
    }
    comprobarNuevoVirus() {
            this.contadorInfeccion++;

            if (this.contadorInfeccion == 500) {
                this.contadorInfeccion = 0;
                this.entidades.push(createVirus(nuevoColor(), Math.floor((Math.random() * 400)) + 50, 100));
                this.crearBolaParadaFlotante();
            }
        }
        //cuando se destruyen bolas sin que haya una infectada, creamos nuevaas bolas vacias que aparecen dese abajo.
    crearBolaParadaFlotante() {
        let newX = 50 + (Math.round((Math.random() * 10)) * 50);
        let crear = true;
        this.lastXNuevaBola.forEach(x => {
            if (crear)
                if (newX > x - 30 && newX < x + 30) {
                    crear = false;
                }
        });
        if (crear) {
            let bolaColor = this.nuevaBola(newX, canvas.height);
            this.lastXNuevaBola.push(newX);
            bolaColor.update = bolaColor.updateParada;
            this.bolasParadas.push(bolaColor);
            bolaColor.velocidadBajar = 10;
            bolaColor.intocable = true;
            bolaColor.moverse = true;
        } else {
            this.crearBolaParadaFlotante();
        }
    }

    comprobarColisionBolasParadas(bola) {

        pantallaActual.bolasParadas.forEach((bolaParada2) => {
            if (bola != bolaParada2 && !this.aDestruir.has(bolaParada2) && (!bola.intocable && !bolaParada2.intocable)) {
                let upLeft = colision(bola.x, bola.y, bolaParada2);
                let upRight = colision(bola.x + bola.tam, bola.y, bolaParada2);
                let left = colision(bola.x - 10, bola.y + (bola.tam / 2), bolaParada2);
                let right = colision(bola.x + bola.tam + 10, bola.y + (bola.tam / 2), bolaParada2);
                let downLeft = colision(bola.x, bola.y + bola.tam, bolaParada2);
                let downRight = colision(bola.x + bola.tam, bola.y + bola.tam, bolaParada2);
                if (upLeft || upRight || left || right || downLeft || downRight) {
                    if (bola.color != "marron" && bola.color == bolaParada2.color) {
                        this.aDestruir.add(bola);
                        this.aDestruir.add(bolaParada2);
                        this.comprobarColisionBolasParadas(bolaParada2);
                    }
                }
            }
        });
    }

    //dibujar
    draw() {
        const rectangle = new Path2D();
        bufferctx.clearRect(0, 0, canvas.width, canvas.height);
        bufferctx.fillStyle = "rgba(100, 0, 0)";
        rectangle.rect(0, 0, canvas.width, canvas.height);
        bufferctx.fill(rectangle);

        bufferctx.drawImage(imagenes.fondo, 30, 0, canvas.width - 35, canvas.height);
        bufferctx.drawImage(imagenes.neurona, 5, 560, canvas.width, 200);

        this.bolaActual.draw();
        aplicarSombras();
        this.entidades.forEach((entidad) => { entidad.draw(); });
        bufferctx.restore();
        this.bolasParadas.forEach((entidad) => { entidad.draw(); });
        this.entidadesDestruir.forEach((entidad) => { entidad.draw(); });
        this.bolasLanzadas.forEach(bolaLanzada => {
            aplicarSombras();
            bolaLanzada.draw();
            bufferctx.restore();
        });
        this.textos.forEach(texto => texto.draw());
        this.pintarHUD();

    }
    pintarBolasMarronesAtrezzo(x, y) {
        bufferctx.drawImage(imagenes.marron, x, y, 50, 50);
    }

    pintarHUD() {


        //bolas marrones
        for (let i = 0; i < 12; i++) {
            this.pintarBolasMarronesAtrezzo((50 * i), 50);
        }
        for (let i = 0; i < this.posicionesXBolaParada.length; i++) {
            this.pintarBolasMarronesAtrezzo(this.posicionesXBolaParada[i], this.posicionesYBolaParada[i]);
        }

        bufferctx.fillStyle = "black";
        const rectangle = new Path2D();
        rectangle.rect(0, 0, 25, 800);
        bufferctx.fill(rectangle);
        rectangle.rect(575, 0, 599, 800);
        bufferctx.fill(rectangle);
        rectangle.rect(0, 0, 599, 75);
        bufferctx.fill(rectangle);
        rectangle.rect(0, 725, 599, 100);
        bufferctx.fill(rectangle);

        // hay que pintar el texto de infeccion, pantalla - nivel y puntuacion
        printText(INFECCION + this.infeccion, 30, 50, "pink", 30, "left", false, false);
        printText(INFECCION + this.infeccion, 30, 50, "red", 30, "left", true, false);

        printText(this.pantallaNivel, 300, 50, "white", 30, "center", false, false);
        printText(this.pantallaNivel, 300, 50, "cyan", 30, "center", true, false);

        let puntLiteral = PUNTOS + puntuacion;
        printText(puntLiteral, 570, 50, "white", 30, "right", false, false);
        printText(puntLiteral, 570, 50, "gold", 30, "right", true, false);

        if (this.youWin) {
            this.pintarFinJuego(YOU, WIN);
        } else if (this.gameover) {
            this.pintarFinJuego(GAME, OVER);
        }

        bufferctx.drawImage(imagenes.reemplazar, 230, bolaPeqStartY - 10, 200, 50);
        printText(REEMPLAZAR, 370, bolaPeqStartY + 22, "white", 22, "center", false, false);
        this.bolaSiguiente.draw();


        if (this.cuentaInicial) {
            printText(this.conteoInicial, 300, 400, "gold", this.contadorInicial);
            printText(this.conteoInicial, 300, 400, "white", this.contadorInicial, "center", true);
        }

        if (false) {
            if (this.lastMousePos != null) {

                bufferctx.beginPath();
                bufferctx.moveTo(this.lastMousePos.x, this.lastMousePos.y);
                bufferctx.lineTo(bolaGrandeStartX + 25, bolaGrandeStartY + 25);

                bufferctx.strokeStyle = "cyan";
                bufferctx.stroke();
            }
        }

    }

    pintarFinJuego(mensaje1, mensaje2) {
        this.contadorInicial += this.conteoInicial;
        if (this.contadorInicial < 100) {
            this.conteoInicial = 2;
        } else if (this.contadorInicial > 150) {
            this.conteoInicial = -2;
        }

        this.isPuedeLanzarBola = false;
        printText(mensaje1, 300, 300, "red", this.contadorInicial);
        printText(mensaje2, 300, 400, "red", this.contadorInicial);
        printText(mensaje1, 300, 300, "white", this.contadorInicial, "center", true);
        printText(mensaje2, 300, 400, "white", this.contadorInicial, "center", true);
    }
    nuevasBolas() {
        this.nuevaBolaActual();
        this.nuevaBolaSiguiente();
    }

    nuevaBolaActual() {
        let colorLiteral = nuevoColor();
        let bola = new Bola(colorLiteral, bolaGrandeStartX, bolaGrandeStartY);
        this.bolaActual = bola;
    }

    nuevaBolaSiguiente() {
        let newColor = nuevoColor();
        while (newColor == this.bolaActual.color) {
            newColor = nuevoColor();
        }

        let bola = new Bola(newColor, bolaPeqStartX, bolaPeqStartY, 30);
        this.bolaSiguiente = bola;
    }

    nuevaBolaDeBola(bola, distanceX, distanceY) {
        let nuevaBola = new Bola(bola.color, bola.x, bola.y);
        nuevaBola.update = nuevaBola.updateLanzada;
        nuevaBola.distanceX = distanceX;
        nuevaBola.distanceY = distanceY;
        return nuevaBola;
    }
    nuevaBola(x, y) {
        let colorLiteral = nuevoColor();
        let nuevaBola = new Bola(colorLiteral, x, y);
        return nuevaBola;
    }
    nuevaBolaParada(x, y = 0) {
        let colorLiteral = "marron";
        let bola = new Bola(colorLiteral, x, y);
        bola.pararBola();
        bola.colocarBola();
        bola.estatica();
        return bola;
    }
    nuevaBolaGlobuloRosa() {
        if (document.hasFocus()) {
            let newX = 50 + (Math.round((Math.random() * 10)) * 50);
            let bola = new Bola("rojo", newX, canvas.height, 30);
            bola.update = bola.updateGlobuloRosa;
            pantallaActual.textos.push(bola);
        }
    }
    comprobarColision(ent1, ent2) {
        let result = false;
        let colPoints = colisionPoints(ent1);

        let up = colision(colPoints.up.x, colPoints.up.y, ent2);
        let upLeft = colision(colPoints.upLeft.x, colPoints.upLeft.y, ent2);
        let upRight = colision(colPoints.upRight.x, colPoints.upRight.y, ent2);
        let downLeft = colision(colPoints.downLeft.x, colPoints.downLeft.y, ent2);
        let downRight = colision(colPoints.downRight.x, colPoints.downRight.y, ent2);

        if (up || upLeft || upRight || downLeft || downRight) {
            result = true;
        }

        return result;
    }

}

function colisionPoints(ent) {
    return {
        up: { x: ent.x + ent.tam / 2, y: ent.y + minTamColision },
        upLeft: { x: ent.x + ent.tam / 3, y: ent.y + minTamColision },
        upRight: { x: ent.x + ent.tam / 3 * 2, y: ent.y + minTamColision },
        downLeft: { x: ent.x + minTamColision, y: ent.y - minTamColision + ent.tam },
        downRight: { x: ent.x - minTamColision + ent.tam, y: ent.y - minTamColision + ent.tam },

    };
}


function colision(entx, enty, entidad2) {

    let xl1 = entidad2.x + (entidad2.tam / 4);
    let y1 = entidad2.y;
    let xr1 = entidad2.x + ((entidad2.tam / 4) * 3);
    let y4 = entidad2.y + entidad2.tam;
    //
    let xl2 = entidad2.x;
    let y2 = entidad2.y + ((entidad2.tam / 4));
    let xr2 = entidad2.x + entidad2.tam;
    let y3 = entidad2.y + ((entidad2.tam / 4) * 3);
    return (
        (entx >= xl1 &&
            entx <= xr1 &&
            enty >= y1 &&
            enty <= y4) ||
        (entx >= xl2 &&
            entx <= xr2 &&
            enty >= y2 &&
            enty <= y3)
    );
}

function nuevoColor() {
    let maxLevel = nivel;
    if (maxLevel > 4) maxLevel = 3;
    let color = tirada(maxLevel + 2);
    let colorLiteral = imagenesLiterales[color];
    return colorLiteral;
}

function tirada(max) {
    return Math.floor((Math.random() * (max)));
}