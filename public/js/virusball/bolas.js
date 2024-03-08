/*jshint esversion: 6 */

class Bola {
    constructor(color, x, y, tam = 50) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.tam = tam;
        this.distanceX = 0;
        this.distanceY = 0;
        this.opacidad = 1;
        this.contadorDestruir = 0;
        this.contadorParpadeo = 0;
        this.moverse = true;
        this.infectada = 0;
        this.contadorInflarse = 0;
        this.inflarse = false;
        this.contadorTiempoInfectada = 0;
        this.velocidadBajar = 2;
        this.contadorIdBolas = pantallaActual.contadorIdBolas++;
        this.intocable = false;
        this.colisionable = true;
        this.umbralHuir = 750;
    }
    noUpdate() {}
    update() {}
    updateInfectada() {
        this.updateParada();
        this.contadorTiempoInfectada++;
        if (this.contadorTiempoInfectada > this.umbralHuir) {
            this.marcarDestruirBola();
            for (let i = 0; i < this.infectada; i++) {
                let virus = new VirusGusano(this.color, this.x - 15 + (Math.round(Math.random() * 30)), this.y);
                pantallaActual.entidades.push(virus);
                pantallaActual.bolasParadas.splice(pantallaActual.bolasParadas.indexOf(this), 1);
                pantallaActual.entidades.push(new Explosion(this.x, this.y));
                pantallaActual.textos.push(new Texto(FUGA, this.x + this.tam / 2, this.y, this.color));
            }
            this.infectada = 0;
        }
    }
    updateParada() {

        if (this.moverse) {
            if (this.x < 90) {
                this.x = 90;
            } else if (this.x >= 500) {
                this.x = 499;
            }
            if (this.y > 90) {

                this.y -= this.velocidadBajar;

                let devolverPosicion = false;
                pantallaActual.bolasParadas.forEach((bolaParada) => {
                    if (this != bolaParada && !devolverPosicion) {

                        if (bolaParada.y == this.y - (40 - this.velocidadBajar) && (bolaParada.x - 25 == this.x || bolaParada.x + 25 == this.x || bolaParada.x == this.x)) {
                            devolverPosicion = true;
                        }
                    }
                });
                if (devolverPosicion) {
                    this.y += this.velocidadBajar;
                    this.moverse = false;
                    this.colocarBola();
                }
            } else {
                this.colocarBola();
            }
        }
    }

    updateLanzada() {
        // Actualiza la posición de la imagen en cada iteración

        if (this.y > 90) {
            if (this.x < 50 || this.x > 500) {
                this.distanceX = this.distanceX * -1;
            }
            this.x += this.distanceX;
            this.y += this.distanceY;
        } else {
            this.colocarBola();
            this.pararBolaLanzada();
        }

    }


    updateDestruir() {

        this.contadorDestruir -= 0.1;
        this.opacidad = this.contadorDestruir;
        if (this.contadorDestruir < 0) {
            return true;
        }
        return false;
    }

    updateGlobuloRosa() {
        this.y -= 10;
        if (this.y <= 0) {
            pantallaActual.textos.splice(pantallaActual.textos.indexOf(this), 1);
        }
    }

    impactada() {
        alert(this.color, " ejecuta impactada! revisar");
    }
    colocarBola() {
        this.intocable = false;
        this.velocidadBajar = 2;
        if (this.y < 90) this.y = 90;
        let posX = Math.floor((this.x) / 50);
        let posY = Math.floor((this.y) / 40);
        let reposicionamientoY = 10;
        let newY = (posY * 40) + reposicionamientoY;
        let reposicionamientoX = 25;
        let tempNewX = (posX * 50);
        if (posY % 2 != 0) {
            let comparacion = this.x - tempNewX;
            if (comparacion <= 25) {
                reposicionamientoX = 0;
            } else {
                reposicionamientoX = 50;
            }
        }
        let newX = tempNewX + reposicionamientoX;
        this.x = newX;
        this.y = newY;

    }

    pararBola() {
        this.intocable = false;
        if (this.infectada > 0) {
            this.update = this.updateInfectada;
        } else
            this.update = this.updateParada;

        pantallaActual.bolasParadas.push(this);
        this.moverse = false;
        return this;
    }

    pararBolaLanzada() {
        pantallaActual.ultimaBolaLanzada = this.contadorIdBolas;
        pantallaActual.bolasLanzadas.splice(pantallaActual.bolasLanzadas.indexOf(this), 1);

        return this.pararBola();
    }

    marcarDestruirBola() {
        pantallaActual.entidadesDestruir.push(this);
        this.update = this.updateDestruir;
        this.contadorDestruir = 1;
    }

    infectarBola(escapista) {
        if (escapista) this.umbralHuir -= 100;

        this.infectada++;
        this.draw = this.drawInfectada;
    }

    estatica() {
        this.update = this.noUpdate;
    }

    drawInfectada() {

        if (this.contadorTiempoInfectada > this.umbralHuir - 100) {

            if (this.contadorTiempoInfectada % 2 == 0) {
                if (this.contadorParpadeo == 0)
                    this.opacidad -= 0.1;
                else this.opacidad += 0.1;
            }

            if (this.opacidad < 0.5) {
                this.contadorParpadeo = 1;
            }
            if (this.opacidad >= 1) {
                this.contadorParpadeo = 0;
            }
        }


        if (this.inflarse) {
            if (this.contadorInflarse < 5) {
                this.contadorInflarse++;
            } else {
                this.inflarse = false;
            }
        } else {
            if (this.contadorInflarse > -5) {
                this.contadorInflarse--;
            } else {
                this.inflarse = true;
            }
        }
        bufferctx.globalAlpha = this.opacidad;
        bufferctx.drawImage(imagenes[this.color], this.x - this.contadorInflarse / 2, this.y + this.contadorInflarse / 2, this.tam + this.contadorInflarse, this.tam - this.contadorInflarse);
        bufferctx.globalAlpha = 1;
    }
    draw() {

        bufferctx.globalAlpha = this.opacidad;
        bufferctx.drawImage(imagenes[this.color], this.x, this.y, this.tam, this.tam);
        bufferctx.globalAlpha = 1;

        if (false) {
            let xl1 = this.x + (this.tam / 4);
            let y1 = this.y;
            let xr1 = ((this.tam / 2));
            let y4 = this.tam;
            //
            bufferctx.strokeStyle = 'white';
            const rectangle = new Path2D();
            rectangle.rect(xl1, y1, xr1, y4);
            bufferctx.stroke(rectangle);
            //
            let xl2 = this.x;
            let y2 = this.y + ((this.tam / 4));
            let xr2 = this.tam;
            let y3 = ((this.tam / 2));
            const rectangle2 = new Path2D();
            bufferctx.strokeStyle = 'red';
            rectangle2.rect(xl2, y2, xr2, y3);
            bufferctx.stroke(rectangle2);

            let pintarLinea = (x1, y1, x2, y2) => {
                bufferctx.strokeStyle = 'orange';

                bufferctx.beginPath();
                bufferctx.moveTo(x1, y1);
                bufferctx.lineTo(x2, y2);
                bufferctx.stroke();
            };
            pintarLinea(this.x, this.y, this.x + this.tam, this.y);
            pintarLinea(this.x - 10, this.y + (this.tam / 2), this.x + 10 + this.tam, this.y + (this.tam / 2));

        }
    }

}