import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-matematicas-9',
  standalone: false,
  templateUrl: './matematicas-9.component.html',
  styleUrl: './matematicas-9.component.css'
})
export class Matematicas9Component {
  numeros: number[] = [];
  intermedio: number = 0;

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
    const set = new Set<number>();
    while (set.size < 3) set.add(Math.floor(Math.random() * 100) + 1);
    this.numeros = Array.from(set);

    const ordenada = [...this.numeros].sort((a, b) => a - b);
    this.intermedio = ordenada[1];

    this.mensaje = '';
    this.color = '';
  }

  verificar(opcionSeleccionada: number): void {
    if (opcionSeleccionada === this.intermedio) {
      this.mensaje = '✔ Correcto';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = `❌ Incorrecto. El intermedio era ${this.intermedio}`;
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

  reiniciar(): void {
    this.ejercicioActual = 1;
    this.aciertos = 0;
    this.terminado = false;
    this.calificacion = 0;
    this.generarEjercicio();
  }
}
