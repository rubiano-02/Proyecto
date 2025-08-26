import { Component } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-9',
  standalone: false,
  templateUrl: './lectura-9.component.html',
  styleUrl: './lectura-9.component.css'
})
export class Lectura9Component {
 frasesCorrectas = [
    'Se despertó.',
    'Se vistió.',
    'Desayunó.',
    'Fue al colegio.'
  ];
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  frases = [...this.frasesCorrectas].sort(() => Math.random() - 0.5);
  mensaje = '';
  calificacion = 0;
  terminado = false;
  totalEjercicios = 5;

  constructor(private resultadosService: ResultadosService) {}

  soltar(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.frases, event.previousIndex, event.currentIndex);
  }

  verificar() {
  let correctas = 0;
  this.frases.forEach((f, i) => {
    if (f === this.frasesCorrectas[i]) correctas++;
  });

  const total = this.frases.length;
  this.calificacion = Math.round((correctas / total) * 5);

  this.mensaje = correctas === total
    ? '✔ ¡Secuencia correcta!'
    : `¡Intenta de nuevo!`;

  this.terminado = true;
  this.guardarResultado();
}


  guardarResultado() {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;
    const idUsuario = +idUsuarioStr;
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: () => console.log('✅ Resultado guardado'),
      error: err => console.error('❌ Error al guardar resultado:', err)
    });
  }
}
