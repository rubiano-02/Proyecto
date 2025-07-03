import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';

@Component({
  selector: 'app-matematicas-15',
  standalone: false,
  templateUrl: './matematicas-15.component.html',
  styleUrl: './matematicas-15.component.css'
})
export class Matematicas15Component {
  numero: number = 0;
  descomposicionCorrecta: string = '';
  opciones: string[] = [];

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
  this.numero = Math.floor(Math.random() * 90) + 10; // entre 10 y 99
  const decenas = Math.floor(this.numero / 10) * 10;
  const unidades = this.numero % 10;
  this.descomposicionCorrecta = `${decenas} + ${unidades}`;

  const opcionesSet = new Set<string>();
  opcionesSet.add(this.descomposicionCorrecta);

  let intentos = 0;
  while (opcionesSet.size < 4 && intentos < 100) {
    intentos++;
    let variacionDecenas = decenas + (Math.floor(Math.random() * 5) - 2) * 10; // más rango de variación
    let variacionUnidades = unidades + (Math.floor(Math.random() * 7) - 3);

    if (variacionDecenas < 0) variacionDecenas = 0;
    if (variacionUnidades < 0) variacionUnidades = 0;

    // solo evitar que sea igual a la correcta
    const opcion = `${variacionDecenas} + ${variacionUnidades}`;
    if (!opcionesSet.has(opcion)) {
      opcionesSet.add(opcion);
    }
  }

  this.opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5);

  this.mensaje = '';
  this.color = '';
}


  verificar(opcionSeleccionada: string): void {
    if (opcionSeleccionada === this.descomposicionCorrecta) {
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
