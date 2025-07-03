import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';

@Component({
  selector: 'app-matematicas-13',
  standalone: false,
  templateUrl: './matematicas-13.component.html',
  styleUrl: './matematicas-13.component.css'
})
export class Matematicas13Component {
  dividendo: number = 0;
  divisor: number = 0;
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
    // Genera un divisor entre 2-10 y resultado entre 1-10
    this.divisor = Math.floor(Math.random() * 9) + 2;
    this.resultadoCorrecto = Math.floor(Math.random() * 10) + 1;
    this.dividendo = this.divisor * this.resultadoCorrecto;

    const opcionesSet = new Set<number>();
    opcionesSet.add(this.resultadoCorrecto);

    while (opcionesSet.size < 4) {
      const variacion = Math.floor(Math.random() * 5) - 2;
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
