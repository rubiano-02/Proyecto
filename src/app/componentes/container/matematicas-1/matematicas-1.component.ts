import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
// Ajusta la ruta según tu estructura

@Component({
  selector: 'app-matematicas-1',
  standalone: false,
  templateUrl: './matematicas-1.component.html',
  styleUrl: './matematicas-1.component.css'
})
export class Matematicas1Component {
  numero1: number = 0;
  numero2: number = 0;
  respuestaUsuario: number | null = null;
  mensaje: string = '';
  color: string = '';
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;
  calificacion: number = 0;
  imagenSrc = 'assets/Images/pensando.png';

cambiarImagen(hover: boolean) {
  this.imagenSrc = hover
    ? 'assets/Images/PenAyuda.png'
    : 'assets/Images/pensando.png';
}

  constructor(private resultadosService: ResultadosService) { }
  ngOnInit(): void {
    this.generarNuevaSuma();
  }
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  generarNuevaSuma(): void {
    this.numero1 = Math.floor(Math.random() * 50) + 10; // Números más grandes: 10-59
    this.numero2 = Math.floor(Math.random() * 50) + 10;
    this.respuestaUsuario = null;
    this.mensaje = '';
    this.color = '';
  }

  verificar(): void {
    const resultado = this.numero1 + this.numero2;
    if (this.respuestaUsuario === resultado) {
      this.mensaje = '¡Correcto! 🎉';
      this.color = 'green';
      this.aciertos++;
    } else {
      this.mensaje = `Incorrecto. La respuesta era ${resultado}. 😞`;
      this.color = 'red';
    }

    if (this.ejercicioActual < this.totalEjercicios) {
      setTimeout(() => {
        this.ejercicioActual++;
        this.generarNuevaSuma();
      }, 2000);
    } else {
      setTimeout(() => {
        this.terminado = true;
        this.calificacion = this.aciertos;
        this.guardarResultado(); // 1 a 5
      }, 2000);
    }
  }



guardarResultado(): void {
  const idUsuarioStr = localStorage.getItem('user_id');
  if (!idUsuarioStr) {
    console.warn('⚠️ ID de usuario no encontrado en localStorage');
    return;
  }

  const idUsuario = Number(idUsuarioStr);
  const calificacion = this.calificacion;
  const tiempo_dedicado = this.totalEjercicios * 2;

  this.resultadosService.guardarResultado(idUsuario, calificacion, tiempo_dedicado).subscribe({
    next: (response:any) => {
      console.log('✅ Resultado guardado:', response);
      alert('Resultado guardado correctamente');
    },
    error: (error:any) => {
      console.error('❌ Error al guardar resultado:', error);
      alert('Error al guardar resultado');
    }
  });
}



  reiniciar(): void {
    this.ejercicioActual = 1;
    this.aciertos = 0;
    this.terminado = false;
    this.calificacion = 0;
    this.generarNuevaSuma();
  }
}
