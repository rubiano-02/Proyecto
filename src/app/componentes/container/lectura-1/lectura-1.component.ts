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
   opciones = ['cama', 'cielo', 'fruta'];
  palabraCorrecta = 'cama';
  palabraSeleccionada: string | null = null;
  mensaje = '';
  color = '';

  soltar(event: CdkDragDrop<any>) {
  if (event.previousContainer === event.container) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
  } else {
    // Solo permitir una palabra en el cajón
    if (event.container.id === 'cajon') {
      this.palabraSeleccionada = event.previousContainer.data[event.previousIndex];
      event.previousContainer.data.splice(event.previousIndex, 1);
    } else if (event.container.id === 'opciones') {
      if (this.palabraSeleccionada) {
        event.container.data.push(this.palabraSeleccionada);
        this.palabraSeleccionada = null;
      }
    }
  }
}


  verificar() {
    if (!this.palabraSeleccionada) {
      this.mensaje = 'Debes completar la frase. 📌';
      this.color = 'orange';
      return;
    }

    if (this.palabraSeleccionada === this.palabraCorrecta) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
    } else {
      this.mensaje = 'Incorrecto. Intenta de nuevo. ❌';
      this.color = 'red';
    }
  }
}
