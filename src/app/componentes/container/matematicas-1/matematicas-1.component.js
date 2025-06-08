import { __decorate } from "tslib";
import { Component } from '@angular/core';
let Matematicas1Component = class Matematicas1Component {
    numero1 = 0;
    numero2 = 0;
    respuestaUsuario = null;
    mensaje = '';
    color = '';
    ejercicioActual = 1;
    totalEjercicios = 5;
    aciertos = 0;
    terminado = false;
    calificacion = 0;
    ngOnInit() {
        this.generarNuevaSuma();
    }
    generarNuevaSuma() {
        this.numero1 = Math.floor(Math.random() * 50) + 10; // Números más grandes: 10-59
        this.numero2 = Math.floor(Math.random() * 50) + 10;
        this.respuestaUsuario = null;
        this.mensaje = '';
        this.color = '';
    }
    verificar() {
        const resultado = this.numero1 + this.numero2;
        if (this.respuestaUsuario === resultado) {
            this.mensaje = '¡Correcto! 🎉';
            this.color = 'green';
            this.aciertos++;
        }
        else {
            this.mensaje = `Incorrecto. La respuesta era ${resultado}. 😞`;
            this.color = 'red';
        }
        if (this.ejercicioActual < this.totalEjercicios) {
            setTimeout(() => {
                this.ejercicioActual++;
                this.generarNuevaSuma();
            }, 2000);
        }
        else {
            setTimeout(() => {
                this.terminado = true;
                this.calificacion = this.aciertos; // 1 a 5
            }, 2000);
        }
    }
    reiniciar() {
        this.ejercicioActual = 1;
        this.aciertos = 0;
        this.terminado = false;
        this.calificacion = 0;
        this.generarNuevaSuma();
    }
};
Matematicas1Component = __decorate([
    Component({
        selector: 'app-matematicas-1',
        standalone: false,
        templateUrl: './matematicas-1.component.html',
        styleUrl: './matematicas-1.component.css'
    })
], Matematicas1Component);
export { Matematicas1Component };
