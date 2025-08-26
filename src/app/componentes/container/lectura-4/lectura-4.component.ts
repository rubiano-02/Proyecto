import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-4',
  standalone: false,
  templateUrl: './lectura-4.component.html',
  styleUrl: './lectura-4.component.css'
})
export class Lectura4Component {
 frases = [
    { texto: '“¡Hora de dormir!”', personajeCorrecto: 'Mamá', seleccionado: '' },
    { texto: '“¡Quiero más cuento!”', personajeCorrecto: 'Hijo', seleccionado: '' }
  ];

  personajes = ['Mamá', 'Hijo'];
  calificacion: number = 5;
  terminado = false;
  totalEjercicios = 5;

  constructor(private resultadosService: ResultadosService) {}

  seleccionar(fraseIndex: number, personaje: string) {
    this.frases[fraseIndex].seleccionado = personaje;

    const todasRespondidas = this.frases.every(f => f.seleccionado !== '');
    if (todasRespondidas) {
      const aciertos = this.frases.filter(f => f.seleccionado === f.personajeCorrecto).length;
      this.calificacion = Math.round((aciertos / this.frases.length) * 5);
      this.terminado = true;
      this.guardarResultado();
    }
  }
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}

  guardarResultado(): void {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const calificacion = this.calificacion;
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, calificacion, tiempo_dedicado).subscribe({
      next: () => console.log('✅ Resultado guardado'),
      error: err => console.error('❌ Error al guardar:', err)
    });
  }
}
