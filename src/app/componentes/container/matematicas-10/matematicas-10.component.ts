import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';

@Component({
  selector: 'app-matematicas-10',
  standalone: false,
  templateUrl: './matematicas-10.component.html',
  styleUrl: './matematicas-10.component.css'
})
export class Matematicas10Component {
  serieMostrada: (number | string)[] = [];
  solucionCorrecta: number = 0;
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
    const inicio = Math.floor(Math.random() * 20);
    const salto = Math.floor(Math.random() * 5) + 1; // saltos entre 1 y 5
    const posicionOculta = Math.floor(Math.random() * 4); // ocultar entre el 0 y el 3

    this.serieMostrada = [];
    for (let i = 0; i < 4; i++) {
      const valor = inicio + i * salto;
      this.serieMostrada.push(i === posicionOculta ? '?' : valor);
      if (i === posicionOculta) this.solucionCorrecta = valor;
    }

    const opcionesSet = new Set<number>();
    opcionesSet.add(this.solucionCorrecta);
    while (opcionesSet.size < 4) {
      const variacion = Math.floor(Math.random() * 10) - 5;
      opcionesSet.add(this.solucionCorrecta + variacion);
    }
    this.opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5);

    this.mensaje = '';
    this.color = '';
  }

  verificar(opcion: number): void {
    if (opcion === this.solucionCorrecta) {
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
