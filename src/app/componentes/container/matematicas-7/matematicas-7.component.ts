import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-matematicas-7',
  standalone: false,
  templateUrl: './matematicas-7.component.html',
  styleUrl: './matematicas-7.component.css'
})
export class Matematicas7Component {
numeros: number[] = [];
  mayor: number = 0;
  opciones: number[] = [];

  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  constructor(private resultadosService: ResultadosService) {}

  ngOnInit(): void {
    this.generarEjercicio();
  }

  generarEjercicio(): void {
    this.numeros = [
      Math.floor(Math.random() * 100) + 1,
      Math.floor(Math.random() * 100) + 1,
      Math.floor(Math.random() * 100) + 1,
    ];

    this.mayor = Math.max(...this.numeros);

    const opcionesSet = new Set<number>();
    opcionesSet.add(this.mayor);

    while (opcionesSet.size < 4) {
      const variacion = Math.floor(Math.random() * 50) + 1;
      opcionesSet.add(variacion);
    }

    this.opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5);

    this.mensaje = '';
    this.color = '';
  }

  verificar(opcionSeleccionada: number): void {
    if (opcionSeleccionada === this.mayor) {
      this.mensaje = '✔ Correcto';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = `❌ Incorrecto`;
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
