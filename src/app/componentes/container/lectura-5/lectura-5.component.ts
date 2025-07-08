import { Component } from '@angular/core';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-5',
  standalone: false,
  templateUrl: './lectura-5.component.html',
  styleUrl: './lectura-5.component.css'
})
export class Lectura5Component {
  respuestas: (string | null)[] = [null];
  opciones = ['contento', 'azul', 'triste'];
  correctas = ['contento'];
  animar = [false];
  calificacion = 5;
  mensaje = '';
  terminado = false;
  totalEjercicios = 5;

  constructor(private resultadosService: ResultadosService) {}

  soltar(event: CdkDragDrop<any>, index: number) {
  if (index < 0 || index >= this.respuestas.length) return;

  if (event.previousContainer === event.container) return;
  const palabra = event.previousContainer.data[event.previousIndex];

  if (!this.respuestas[index]) {
    this.respuestas[index] = palabra;
    event.previousContainer.data.splice(event.previousIndex, 1);
    this.animar[index] = false;
    setTimeout(() => this.animar[index] = true, 10);
  }
}

  insertarPorClick(palabra: string, i: number) {
    const index = this.respuestas.findIndex(r => r === null);
    if (index !== -1) {
      this.respuestas[index] = palabra;
      this.opciones.splice(i, 1);
      this.animar[index] = false;
      setTimeout(() => this.animar[index] = true, 10);
    }
  }

  sacar(index: number) {
    if (this.respuestas[index]) {
      this.opciones.push(this.respuestas[index]!);
      this.respuestas[index] = null;
    }
  }

  verificar() {
    if (this.respuestas.includes(null)) {
      this.mensaje = 'Debes completar la frase.';
      return;
    }

    const esCorrecto = this.respuestas.every((r, i) => r === this.correctas[i]);
    if (esCorrecto) {
      this.mensaje = '✔ Correcto';
      this.terminado = true;
      this.guardarResultado();
    } else {
      this.calificacion = 0;
      this.mensaje = `❌ Solución correcta: ${this.correctas.join(', ')}`;
      this.terminado = true;
      this.guardarResultado();
    }
  }

  guardarResultado(): void {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: () => console.log('✅ Resultado guardado'),
      error: err => console.error('❌ Error al guardar:', err)
    });
  }
}
