import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-7',
  standalone: false,
  templateUrl: './lectura-7.component.html',
  styleUrl: './lectura-7.component.css'
})
export class Lectura7Component {
  preguntas = [
    { palabras: ['manzana', 'banana', 'tornillo', 'pera'], intrusa: 'tornillo' },
    { palabras: ['rojo', 'azul', 'verde', 'silla'], intrusa: 'silla' },
    { palabras: ['perro', 'gato', 'ratón', 'camión'], intrusa: 'camión' },
    { palabras: ['lunes', 'martes', 'miércoles', 'fútbol'], intrusa: 'fútbol' },
    { palabras: ['correr', 'nadar', 'pintar', 'helado'], intrusa: 'helado' },
  ];

  preguntaActual = 1;
  totalPreguntas = 5;
  calificacion = 0;
  seleccion: string | null = null;
  mensaje = '';
  terminado = false;
  esCorrecto = false;

  constructor(private resultadosService: ResultadosService) {}

  seleccionar(palabra: string) {
    if (this.seleccion) return;

    this.seleccion = palabra;
    const actual = this.preguntas[this.preguntaActual - 1];
    this.esCorrecto = palabra === actual.intrusa;

    if (this.esCorrecto) {
      this.calificacion += 1;
      this.mensaje = '✔ Correcto';
    } else {
      this.mensaje = `❌ La palabra intrusa era: ${actual.intrusa}`;
    }

    setTimeout(() => this.siguiente(), 1500); // Avanza solo después de 1.5 segundos
  }

  siguiente() {
    this.seleccion = null;
    this.mensaje = '';
    if (this.preguntaActual < this.totalPreguntas) {
      this.preguntaActual += 1;
    } else {
      this.terminado = true;
      this.guardarResultado();
    }
  }

  guardarResultado(): void {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const tiempo_dedicado = this.totalPreguntas * 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: () => console.log('✅ Resultado guardado'),
      error: err => console.error('❌ Error al guardar:', err)
    });
  }
}
