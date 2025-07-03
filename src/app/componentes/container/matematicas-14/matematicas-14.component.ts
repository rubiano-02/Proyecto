import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';

@Component({
  selector: 'app-matematicas-14',
  standalone: false,
  templateUrl: './matematicas-14.component.html',
  styleUrl: './matematicas-14.component.css'
})
export class Matematicas14Component {
  numero1: number = 0;
  numero2: number = 0;
  resultadoCorrecto: number = 0;
  opciones: number[] = [];

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
    this.numero1 = Math.floor(Math.random() * 9) + 1;        // 1-9
    this.numero2 = Math.floor(Math.random() * 90) + 10;      // 10-99
    this.resultadoCorrecto = this.numero1 * this.numero2;

    const opcionesSet = new Set<number>();
    opcionesSet.add(this.resultadoCorrecto);

    while (opcionesSet.size < 4) {
      const variacion = Math.floor(Math.random() * 20) - 10;
      const distractor = this.resultadoCorrecto + variacion;
      if (distractor > 0) opcionesSet.add(distractor);
    }

    this.opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5);

    this.mensaje = '';
    this.color = '';
  }

  verificar(opcionSeleccionada: number): void {
    if (opcionSeleccionada === this.resultadoCorrecto) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = 'Incorrecto 😞';
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
}
