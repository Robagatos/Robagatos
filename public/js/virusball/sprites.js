/*jshint esversion: 6 */

function createVirus(color, x, y, tam) {
    return new VirusGordo(color, x, y, tam);
}

class VirusBase {
    constructor(color, x, y, tam = 50) {
        this.color = color;
        this.x = x;
        this.y = y;
        this.tam = tam;
        this.distanceX = Math.random() * -1;
        this.distanceY = (Math.random() + 0.1) / 2;
        this.bonoY = 0;

        this.contadorDestruir = 1;
        this.contadorParar = 0;
        this.maxTiempoParar = 500 + Math.random() * 500;
        this.familia = "virus_peq";
        this.familiaFlip = "virus_peq_flip";
        this.familiaPintar = this.familia;

        this.contadorAnimacion = 0;
        this.imgX = 2;
        this.imgY = 2;
        this.imgAncho = 99;
        this.imgAlto = 99;
        this.arrayAnimacionAndar = [100, 2, 200, 2];
        this.frameAnimacion = 0;
        this.colisionable = true;
        this.escapista = false;
        this.iniciarlizarPosicion();
    }
    iniciarlizarPosicion() {
        let valorAzar = Math.floor(Math.random() * 10);
        if (valorAzar % 2 == 0) {
            this.distanceX = this.distanceX * -1;
            this.girarDerecha();
        } else {
            this.girarIzquierda();
        }
    }
    girarDerecha() {}
    girarIzquierda() {}
    update() {}
    draw() {}
    impactada(bola) {}
}
class VirusGusano extends VirusBase {
    constructor(color, x, y, tam = 35) {
        super(color, x, y, tam);
        this.distanceY = (Math.random() + 0.1);
    }
    girarDerecha() {
        this.familiaPintar = this.familiaFlip;
        switch (this.color) {
            case "rosa":
                this.imgX = 499;
                break;
            case "azul":
                this.imgX = 300;
                break;
            case "amarillo":
                this.imgX = 400;
                break;
            case "naranja":
                this.imgX = 100;
                break;
            case "verde":
                this.imgX = 200;
                break;
            case "morado":
                this.imgX = 2;
                break;
            default:
                this.imgX = 499;
                break;
        }
    }
    girarIzquierda() {
        this.familiaPintar = this.familia;
        switch (this.color) {
            case "rosa":
                this.imgX = 2;
                break;
            case "azul":
                this.imgX = 202;
                break;
            case "amarillo":
                this.imgX = 102;
                break;
            case "naranja":
                this.imgX = 402;
                break;
            case "verde":
                this.imgX = 302;
                break;
            case "morado":
                this.imgX = 499;
                break;
            default:
                this.imgX = 2;
                break;
        }
    }
    update() {
        if (this.contadorParar > this.maxTiempoParar) {
            this.contadorParar = 0;
            this.maxTiempoParar = 150 + Math.random() * 100;
            if (this.distanceY == 0) {
                this.distanceY = (Math.random() + 0.1);
            } else {
                if (Math.floor(Math.random() * 10) % 2 == 0)
                    this.distanceY = 0;
            }
        }
        this.contadorParar++;
        if (this.contadorAnimacion == 5) {
            this.frameAnimacion++;
            this.contadorAnimacion = -1;
        }
        if (this.frameAnimacion == this.arrayAnimacionAndar.length) {
            this.frameAnimacion = 0;
            this.contadorAnimacion = -1;
        }
        this.contadorAnimacion++;
        this.imgY = this.arrayAnimacionAndar[this.frameAnimacion];
        if (this.y < 700) {
            if (this.x < 50) {
                this.distanceX = this.distanceX * -1;
                this.girarDerecha();
            } else if (this.x > 500) {
                this.distanceX = this.distanceX * -1;
                this.girarIzquierda();
            }
            if (this.distanceY != 0) {
                this.x += this.distanceX;
                this.y += this.distanceY + this.bonoY;
            }

        } else {
            pantallaActual.contadorInicial = 150;
            pantallaActual.conteoInicial = -2;
            pantallaActual.gameover = true;
            pantallaActual.virusVencedor = this;
        }
    }
    draw() {
        bufferctx.drawImage(imagenes[this.familiaPintar], this.imgX, this.imgY, this.imgAncho, this.imgAlto, this.x, this.y, this.tam, this.tam);
        if (false) {
            bufferctx.strokeStyle = 'black';
            const rectangle = new Path2D();
            rectangle.rect(this.x + minTamColision, this.y + minTamColision, this.tam - (minTamColision * 2), this.tam - (minTamColision * 2));

            bufferctx.stroke(rectangle);

        }
    }
    impactada(bola) {

        this.y += bola.distanceY * 2;
        this.x += bola.distanceX * 2;
    }
}

class VirusGordo extends VirusBase {
    constructor(color, x, y, tam = 75) {
        super(color, x, y, tam);
        this.familia = "virusgordo";
        this.familiaFlip = "virusgordo_flip";
        this.arrayAnimacionAndar = [0, 100];
        this.frameAnimacion = 0;
        this.imgX = 1;
        this.imgY = 1;
        this.imgAncho = 99;
        this.imgAlto = 99;
        this.bonoY = -1;
        this.escapista = true;
        this.distanceX = Math.random() * -1;
        this.iniciarlizarPosicion();
    }
    update() {
        this.contadorParar++;
        if (this.contadorParar > this.maxTiempoParar) {
            this.contadorParar = 0;
            this.maxTiempoParar = 150 + Math.random() * 100;
            if (this.distanceY == 0) {
                {
                    this.distanceY = (Math.random() + 0.1);
                    this.frameAnimacion = 0;
                    this.contadorAnimacion = 5;
                }

            } else {
                if (Math.floor(Math.random() * 10) % 2 == 0) {
                    this.distanceY = 0;
                    this.frameAnimacion = 1;
                    this.contadorAnimacion = 0;
                    this.bonoY = 0;
                }

            }
        }

        if (this.contadorAnimacion > 2) {
            this.bonoY = -0.2;
        }
        if (this.contadorAnimacion < -2) {
            this.bonoY = 0.2;
        }
        this.contadorAnimacion += this.bonoY;

        this.imgY = this.arrayAnimacionAndar[this.frameAnimacion];
        if (this.y < 700) {
            if (this.x < 50) {
                this.distanceX = this.distanceX * -1;
                this.girarDerecha();
            } else if (this.x > 500) {
                this.distanceX = this.distanceX * -1;
                this.girarIzquierda();
            }
            if (this.distanceY != 0) {
                this.x += this.distanceX;
                this.y += this.distanceY;
            }

        } else {
            pantallaActual.contadorInicial = 150;
            pantallaActual.conteoInicial = -2;
            pantallaActual.gameover = true;
            pantallaActual.virusVencedor = this;
        }
    }
    draw() {
        bufferctx.drawImage(imagenes[this.familiaPintar], this.imgX, this.imgY, this.imgAncho, this.imgAlto, this.x - this.contadorAnimacion, this.y + this.contadorAnimacion, this.tam + this.contadorAnimacion, this.tam - this.contadorAnimacion);
    }
    girarDerecha() {
        this.familiaPintar = this.familiaFlip;
        switch (this.color) {


            case "rosa":
                this.imgX = 600;
                break;
            case "amarillo":
                this.imgX = 500;
                break;
            case "azul":
                this.imgX = 400;
                break;
            case "verde":
                this.imgX = 300;
                break;
            case "naranja":
                this.imgX = 200;
                break;
            case "morado":
                this.imgX = 100;
                break;
            case "rojo":
                this.imgX = 2;
                break;

            default:
                this.imgX = 2;
                break;
        }
    }
    girarIzquierda() {
        this.familiaPintar = this.familia;
        switch (this.color) {
            case "rosa":
                this.imgX = 2;
                break;
            case "amarillo":
                this.imgX = 102;
                break;
            case "azul":
                this.imgX = 202;
                break;
            case "verde":
                this.imgX = 302;
                break;
            case "naranja":
                this.imgX = 402;
                break;
            case "morado":
                this.imgX = 499;
                break;
            case "rojo":
                this.imgX = 599;
                break;
            default:
                this.imgX = 599;
                break;
        }
    }
    impactada(bola) {

        if (this.tam == 75) {
            let bolaColor = new Bola("blanca", this.x + this.tam / 2, this.y + this.tam / 2);
            bolaColor.colocarBola();
            bolaColor.update = bolaColor.updateParada;
            pantallaActual.bolasParadas.push(bolaColor);
            bolaColor.moverse = true;
            this.distanceY = 0;
            this.contadorParar = this.maxTiempoParar - 100;
            this.frameAnimacion = 1;
            this.contadorAnimacion = 0;
        }
    }
}
class Boss extends VirusGordo {
    constructor() {
        super("boss", 250, 210, 125);
        this.distanceY = 0.1;
    }
    update() {
        super.update();
        if (this.y > 500) this.distanceY *= -1;

        if (this.x > 450) {
            this.distanceX = this.distanceX * -1;
            this.girarIzquierda();
        }

        this.x += this.distanceX;

        this.y += this.distanceY;

        pantallaActual.bolasParadas.forEach(bola => {
            if (bola.color != "blanca") {
                // punto izq
                let colisionPuntoA = colision(bola.x + minTamColision, bola.y + minTamColision, this);
                //punto der
                let colisionPuntoB = colision(bola.x + bola.tam - minTamColision, bola.y + minTamColision, this);
                let colisionPuntoC = colision(bola.x + minTamColision, bola.y + (bola.tam) - minTamColision, this);
                //punto der
                let colisionPuntoD = colision(bola.x + bola.tam - minTamColision, bola.y + (bola.tam) - minTamColision, this);
                if (colisionPuntoA || colisionPuntoB || colisionPuntoC || colisionPuntoD) {
                    bola.marcarDestruirBola();
                    pantallaActual.bolasParadas.splice(pantallaActual.bolasParadas.indexOf(bola), 1);
                    pantallaActual.entidades.push(new Explosion(bola.x, bola.y));
                    bola.infectada = 0;
                    let virus = createVirus(bola.color, bola.x, bola.y);
                    // virus.bonoY += 1;
                    pantallaActual.entidades.push(virus);
                    pantallaActual.entidades.push(new Explosion(bola.x, bola.y));
                    pantallaActual.textos.push(new Texto(FUGA, bola.x + bola.tam / 2, bola.y, bola.color));
                }
            }
        });
    }

    impactada(bola) {
        pantallaActual.entidades.push(new VirusGordo(bola.color, bola.x + (bola.tam / 2), bola.y));
    }
}

class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.contadorAnimacion = 0;
        this.contadorDestruir = 0;
        this.contadorFrame = 0;
        this.tam = 100;
        this.imgX = 0;
        this.imgY = 0;
        this.imgAncho = 200;
        this.imgAlto = 200;
        this.frameArrayX = [0, 200, 400, 0, 200, 400];
        this.frameArrayY = [0, 0, 0, 200, 200, 200];
        this.colisionable = false;
    }
    update() {
        this.contadorAnimacion++;
        if (this.contadorAnimacion > 3) {
            this.contadorAnimacion = 0;
            this.contadorFrame++;
            if (this.contadorFrame > 5) pantallaActual.entidades.splice(pantallaActual.entidades.indexOf(this), 1);
        }
    }
    draw() {
        bufferctx.drawImage(imagenes.explosion, this.frameArrayX[this.contadorFrame], this.frameArrayY[this.contadorFrame], this.imgAncho, this.imgAlto, this.x - 25, this.y - 25, this.tam, this.tam);
    }
    impactada(bola) {
        alert(" Explosion ejecuta impactada! revisar");
    }
}

class Texto {
    constructor(text, x, y, color = "white") {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.colisionable = false;
        this.contadorDestruir = 0;
        this.opacidad = 1;
        this.tam = 0;
    }
    update() {
        if (this.tam < 30) this.tam += 2;
        this.contadorDestruir++;
        if (this.contadorDestruir > 40) {
            this.opacidad -= 0.1;
        }
        if (this.contadorDestruir > 50) {
            pantallaActual.textos.splice(pantallaActual.textos.indexOf(this), 1);
        }
    }
    draw() {
        bufferctx.globalAlpha = this.opacidad;
        printText(this.text, this.x, this.y, this.color, this.tam, "center", false, true);
        bufferctx.globalAlpha = 1;

    }
    impactada(bola) {
        alert(" Explosion ejecuta impactada! revisar");
    }
}