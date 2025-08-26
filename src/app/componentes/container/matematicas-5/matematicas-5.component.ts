import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-matematicas-5',
  standalone: false,
  templateUrl: './matematicas-5.component.html',
  styleUrl: './matematicas-5.component.css'
})
export class Matematicas5Component {
numero1: number = 0;
  numero2: number = 0;
  resultado: number = 0;
  operador: string = '+';
  posicion: 'izq' | 'der' = 'izq'; // posición del número oculto

  respuestaUsuario: number | null = null;
  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  constructor(private resultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.generarEjercicio();
  }

  generarEjercicio(): void {
    const operadores = ['+', '-', '*'];
    this.operador = operadores[Math.floor(Math.random() * operadores.length)];
    this.posicion = Math.random() > 0.5 ? 'izq' : 'der';
    this.numero1 = Math.floor(Math.random() * 10) + 1;
    this.numero2 = Math.floor(Math.random() * 10) + 1;

    switch (this.operador) {
      case '+':
        this.resultado = this.numero1 + this.numero2;
        break;
      case '-':
        this.resultado = this.numero1 - this.numero2;
        break;
      case '*':
        this.resultado = this.numero1 * this.numero2;
        break;
    }

    this.respuestaUsuario = null;
    this.mensaje = '';
    this.color = '';
  }

  verificar(): void {
    let esCorrecto = false;

    if (this.posicion === 'izq') {
      switch (this.operador) {
        case '+': esCorrecto = this.respuestaUsuario === this.resultado - this.numero2; break;
        case '-': esCorrecto = this.respuestaUsuario === this.resultado + this.numero2; break;
        case '*': esCorrecto = this.respuestaUsuario === this.resultado / this.numero2; break;
      }
    } else if (this.posicion === 'der') {
      switch (this.operador) {
        case '+': esCorrecto = this.respuestaUsuario === this.resultado - this.numero1; break;
        case '-': esCorrecto = this.respuestaUsuario === this.numero1 - this.resultado; break;
        case '*': esCorrecto = this.respuestaUsuario === this.resultado / this.numero1; break;
      }
    }

    if (esCorrecto) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
      this.aciertos++;
    } else {
      const correcta = this.posicion === 'izq'
        ? this.calcularFaltante(this.numero2, this.resultado, this.operador, 'izq')
        : this.calcularFaltante(this.numero1, this.resultado, this.operador, 'der');

      this.mensaje = `Incorrecto. Era ${correcta}. 😞`;
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

  calcularFaltante(num: number, res: number, op: string, pos: 'izq' | 'der'): number {
    if (pos === 'izq') {
      if (op === '+') return res - num;
      if (op === '-') return res + num;
      if (op === '*') return res / num;
    } else {
      if (op === '+') return res - num;
      if (op === '-') return num - res;
      if (op === '*') return res / num;
    }
    return 0;
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
