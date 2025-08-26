import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-matematicas-6',
  standalone: false,
  templateUrl: './matematicas-6.component.html',
  styleUrl: './matematicas-6.component.css'
})
export class Matematicas6Component {
 numerosOriginal: number[] = [];
  opciones: number[][] = [];
  correcta: number[] = [];

  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;

  constructor(private resultadosService: ResultadosService) {}
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  ngOnInit(): void {
    this.generarEjercicio();
  }

  generarEjercicio(): void {
    // Generar 3 números aleatorios entre 1 y 99
    this.numerosOriginal = [
      Math.floor(Math.random() * 99) + 1,
      Math.floor(Math.random() * 99) + 1,
      Math.floor(Math.random() * 99) + 1,
    ];

    // Calcular la respuesta correcta
    this.correcta = [...this.numerosOriginal].sort((a, b) => a - b);

    // Generar opciones incorrectas con variaciones
    const opcionesSet = new Set<string>();
    opcionesSet.add(this.correcta.join(','));

    while (opcionesSet.size < 4) {
      const nums = [...this.correcta];
      nums.sort(() => Math.random() - 0.5); // desordenar aleatoriamente
      opcionesSet.add(nums.join(','));
    }

    // Convertir a array de arrays de números
    this.opciones = Array.from(opcionesSet).map(o => o.split(',').map(Number)).sort(() => Math.random() - 0.5);

    this.mensaje = '';
    this.color = '';
  }

  verificar(opcionSeleccionada: number[]): void {
    const esCorrecto = opcionSeleccionada.join(',') === this.correcta.join(',');
    if (esCorrecto) {
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
