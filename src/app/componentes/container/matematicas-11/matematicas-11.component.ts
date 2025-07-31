import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';

@Component({
  selector: 'app-matematicas-11',
  standalone: false,
  templateUrl: './matematicas-11.component.html',
  styleUrl: './matematicas-11.component.css'
})
export class Matematicas11Component {
  minuendo: number = 0;
  sustraendo: number = 0;
  resultadoCorrecto: number = 0;
  opciones: number[] = [];
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
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
    // Generar restas con posibilidad de llevadas: minuendo mayor pero cercano al sustraendo
    this.sustraendo = Math.floor(Math.random() * 50) + 10; // entre 10 y 59
    this.minuendo = this.sustraendo + Math.floor(Math.random() * 50) + 10; // mayor que sustraendo

    this.resultadoCorrecto = this.minuendo - this.sustraendo;

    const opcionesSet = new Set<number>();
    opcionesSet.add(this.resultadoCorrecto);

    while (opcionesSet.size < 4) {
      const variacion = Math.floor(Math.random() * 10) - 5;
      opcionesSet.add(this.resultadoCorrecto + variacion);
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
