import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-matematicas-2',
  standalone: false,
  templateUrl: './matematicas-2.component.html',
  styleUrl: './matematicas-2.component.css'
})
export class Matematicas2Component {
 numero1: number = 0;
  numero2: number = 0;
  resultado: number = 0;
  operadorCorrecto: string = '';
  opciones: string[] = ['+', '-', '×', '÷'];

  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;

  constructor(private resultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.generarOperacion();
  }

  generarOperacion(): void {
    const operadores = ['+', '-', '*', '/'];
    this.operadorCorrecto = operadores[Math.floor(Math.random() * operadores.length)];

    this.numero1 = Math.floor(Math.random() * 20) + 1;
    this.numero2 = Math.floor(Math.random() * 10) + 1;

    if (this.operadorCorrecto === '+') this.resultado = this.numero1 + this.numero2;
    else if (this.operadorCorrecto === '-') this.resultado = this.numero1 - this.numero2;
    else if (this.operadorCorrecto === '*') this.resultado = this.numero1 * this.numero2;
    else if (this.operadorCorrecto === '/') {
      this.resultado = this.numero1;
      this.numero1 = this.numero2 * this.resultado; // aseguro divisiones exactas
    }

    this.mensaje = '';
    this.color = '';
  }

  verificar(opcion: string): void {
    const equivalencias: any = { '+': '+', '-': '-', '×': '*', '÷': '/' };
    const operadorElegido = equivalencias[opcion];

    if (operadorElegido === this.operadorCorrecto) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = `Incorrecto. Era '${this.simboloMostrado(this.operadorCorrecto)}' 😞`;
      this.color = 'red';
    }

    if (this.ejercicioActual < this.totalEjercicios) {
      setTimeout(() => {
        this.ejercicioActual++;
        this.generarOperacion();
      }, 2000);
    } else {
      setTimeout(() => {
        this.terminado = true;
        this.calificacion = this.aciertos;
        this.guardarResultado();
      }, 2000);
    }
  }

  simboloMostrado(op: string): string {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  }

  guardarResultado(): void {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const calificacion = this.calificacion;
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, calificacion, tiempo_dedicado).subscribe({
      next: (res) => console.log('✅ Resultado guardado:', res),
      error: (err) => console.error('❌ Error al guardar resultado:', err)
    });
  }

  reiniciar(): void {
    this.ejercicioActual = 1;
    this.aciertos = 0;
    this.terminado = false;
    this.calificacion = 0;
    this.generarOperacion();
  }
}
