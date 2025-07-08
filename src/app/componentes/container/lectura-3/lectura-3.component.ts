import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-3',
  standalone: false,
  templateUrl: './lectura-3.component.html',
  styleUrl: './lectura-3.component.css'
})
export class Lectura3Component {
palabras = [
    { texto: 'El', esCorrecta: false, estado: '' },
    { texto: 'sol', esCorrecta: true, estado: '' },
    { texto: 'se', esCorrecta: false, estado: '' },
    { texto: 'escondió', esCorrecta: false, estado: '' },
    { texto: 'detrás', esCorrecta: false, estado: '' },
    { texto: 'de', esCorrecta: false, estado: '' },
    { texto: 'las', esCorrecta: false, estado: '' },
    { texto: 'nubes.', esCorrecta: false, estado: '' },
    { texto: 'El', esCorrecta: false, estado: '' },
    { texto: 'sol', esCorrecta: true, estado: '' },
    { texto: 'parecía', esCorrecta: false, estado: '' },
    { texto: 'tímido.', esCorrecta: false, estado: '' }
  ];

  correctasTotales = 2;
  aciertos = 0;
  errores = 0;
  calificacion = 0;
  terminado = false;

  constructor(private resultadosService: ResultadosService) {}

  seleccionar(palabra: any) {
    if (palabra.estado !== '') return;

    if (palabra.esCorrecta) {
      palabra.estado = 'correcta';
      this.aciertos++;
    } else {
      palabra.estado = 'incorrecta';
      this.errores++;
    }

    if (this.aciertos === this.correctasTotales) {
      this.terminado = true;
      this.calcularCalificacion();
      this.guardarResultado();
    }
  }

  calcularCalificacion() {
    if (this.errores === 0) this.calificacion = 5;
    else if (this.errores === 1) this.calificacion = 4;
    else if (this.errores === 2) this.calificacion = 3;
    else if (this.errores === 3) this.calificacion = 2;
    else this.calificacion = 1;
  }

  guardarResultado() {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const tiempo_dedicado = 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: res => console.log('✅ Resultado guardado'),
      error: err => console.error('❌ Error al guardar resultado:', err)
    });
  }
}
