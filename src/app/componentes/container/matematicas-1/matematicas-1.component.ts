import { Component } from '@angular/core';

@Component({
  selector: 'app-matematicas-1',
  standalone: false,
  templateUrl: './matematicas-1.component.html',
  styleUrl: './matematicas-1.component.css'
})
export class Matematicas1Component {
numero1: number = 0;
  numero2: number = 0;
  respuestaUsuario: number | null = null;
  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;

  ngOnInit(): void {
    this.generarNuevaSuma();
  }

  generarNuevaSuma(): void {
    this.numero1 = Math.floor(Math.random() * 50) + 10; // Números más grandes: 10-59
    this.numero2 = Math.floor(Math.random() * 50) + 10;
    this.respuestaUsuario = null;
    this.mensaje = '';
    this.color = '';
  }

  verificar(): void {
    const resultado = this.numero1 + this.numero2;
    if (this.respuestaUsuario === resultado) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = `Incorrecto. La respuesta era ${resultado}. 😞`;
      this.color = 'red';
    }

    if (this.ejercicioActual < this.totalEjercicios) {
      setTimeout(() => {
        this.ejercicioActual++;
        this.generarNuevaSuma();
      }, 2000);
    } else {
      setTimeout(() => {
        this.terminado = true;
        this.calificacion = this.aciertos; // 1 a 5
      }, 2000);
    }
  }

  reiniciar(): void {
    this.ejercicioActual = 1;
    this.aciertos = 0;
    this.terminado = false;
    this.calificacion = 0;
    this.generarNuevaSuma();
  }
}
