import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-matematicas-3',
  standalone: false,
  templateUrl: './matematicas-3.component.html',
  styleUrl: './matematicas-3.component.css'
})
export class Matematicas3Component {
  numero1: number = 0;
  numero2: number = 0;
  resultadoReal: number = 0;
  resultadoMostrado: number = 0;
  operador: string = '+';

  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;

  constructor(private resultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.generarEjercicio();
  }

  generarEjercicio(): void {
    const operadores = ['+', '-', '*'];
    this.operador = operadores[Math.floor(Math.random() * operadores.length)];
    this.numero1 = Math.floor(Math.random() * 20) + 1;
    this.numero2 = Math.floor(Math.random() * 20) + 1;

    switch (this.operador) {
      case '+': this.resultadoReal = this.numero1 + this.numero2; break;
      case '-': this.resultadoReal = this.numero1 - this.numero2; break;
      case '*': this.resultadoReal = this.numero1 * this.numero2; break;
    }

    // A veces mostramos el resultado correcto, otras veces uno incorrecto
    const mostrarCorrecto = Math.random() > 0.5;
    this.resultadoMostrado = mostrarCorrecto
      ? this.resultadoReal
      : this.resultadoReal + (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1);

    this.mensaje = '';
    this.color = '';
  }

  verificar(respuestaUsuario: boolean): void {
    const esCorrecto = (this.resultadoMostrado === this.resultadoReal);
    if (respuestaUsuario === esCorrecto) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = `Incorrecto. La respuesta era ${esCorrecto ? 'Verdadero' : 'Falso'}. 😞`;
      this.color = 'red';
    }

    if (this.ejercicioActual < this.totalEjercicios) {
      setTimeout(() => {
        this.ejercicioActual++;
        this.generarEjercicio();
      }, 2000);
    } else {
      setTimeout(() => {
        this.terminado = true;
        this.calificacion = this.aciertos;
        this.guardarResultado();
      }, 2000);
    }
  }

  guardarResultado(): void {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: (res) => console.log('✅ Resultado guardado:', res),
      error: (err) => console.error('❌ Error al guardar resultado:', err)
    });
  }

  reiniciar(): void {
    this.ejercicioActual = 1;
    this.aciertos = 0;
    this.terminado = false;
    this.calificacion = 0;
    this.generarEjercicio();
  }
}
