import { Component } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-lectura-1',
  standalone: false,
  templateUrl: './lectura-1.component.html',
  styleUrl: './lectura-1.component.css'
})
export class Lectura1Component {
   opciones = ['cama', 'sol', 'ratón'];
  respuestas: (string | null)[] = [null, null, null];
  correctas = ['cama', 'sol', 'ratón'];
  animar = [false, false, false];
  mensaje = '';
  color = '';
 calificacion = 5; // Empieza en 5
 intentosFallidos: number = 0;
  soltar(event: CdkDragDrop<any>, index?: number) {
    if (index === undefined || index < 0 || index > 2) return;
    if (event.previousContainer === event.container) return;

    const item = event.previousContainer.data[event.previousIndex];

    if (!this.respuestas[index]) {
      this.respuestas[index] = item;
      event.previousContainer.data.splice(event.previousIndex, 1);

      this.animar[index] = false;
      setTimeout(() => this.animar[index] = true, 10);
    }
  }

  insertarPorClick(opcion: string, i: number) {
    const index = this.respuestas.findIndex(r => r === null);
    if (index !== -1) {
      this.animar[index] = false;
      this.respuestas[index] = opcion;
      this.opciones.splice(i, 1);
      setTimeout(() => this.animar[index] = true, 10);
    }
  }

  sacarDelCajon(index: number) {
    if (this.respuestas[index]) {
      this.opciones.push(this.respuestas[index]!);
      this.respuestas[index] = null;
    }
  }

  verificar() {
       const palabraCorrecta = ['cama', 'sol', 'ratón'];

  const esCorrecto = this.respuestas.length === palabraCorrecta.length &&
                     this.respuestas.every((r, i) => r === palabraCorrecta[i]);

  if (this.respuestas.includes(null)) {
    this.mensaje = 'Debes completar todas las palabras. 📌';
    this.color = 'orange';
    return;
  }

  if (esCorrecto) {
    this.mensaje = `¡Correcto! 🎉 Tu calificación: ${this.calificacion}/5`;
    this.color = 'green';
  } else {
    this.intentosFallidos++;
    this.calificacion = Math.max(0, 5 - this.intentosFallidos);
    this.mensaje = `Incorrecto. Intenta de nuevo.`;
    this.color = 'red';
  }
  }
}
