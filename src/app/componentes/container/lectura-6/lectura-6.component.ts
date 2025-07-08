import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
@Component({
  selector: 'app-lectura-6',
  standalone: false,
  templateUrl: './lectura-6.component.html',
  styleUrl: './lectura-6.component.css'
})
export class Lectura6Component {
 mostrarTexto = true;
  texto = 'El gato saltó sobre la mesa y derramó el vaso de leche.';
  preguntas = [
    {
      pregunta: '¿Qué derramó?',
      opciones: ['Jugo', 'Leche', 'Agua'],
      correcta: 'Leche',
      respuesta: ''
    },
    {
      pregunta: '¿Dónde estaba el gato?',
      opciones: ['Silla', 'Mesa', 'Cama'],
      correcta: 'Mesa',
      respuesta: ''
    }
  ];

  calificacion = 0;
  terminado = false;
  totalEjercicios = 5;

  constructor(private resultadosService: ResultadosService) {}

  ngOnInit() {
    setTimeout(() => this.mostrarTexto = false, 5000);
  }

  seleccionarRespuesta(i: number, opcion: string) {
    this.preguntas[i].respuesta = opcion;
  }

  verificar() {
    const correctas = this.preguntas.filter(p => p.respuesta === p.correcta).length;
    this.calificacion = Math.round((correctas / this.preguntas.length) * 5);
    this.terminado = true;
    this.guardarResultado();
  }

  guardarResultado() {
    const idUsuarioStr = localStorage.getItem('user_id');
    if (!idUsuarioStr) return;

    const idUsuario = Number(idUsuarioStr);
    const tiempo_dedicado = this.totalEjercicios * 2;

    this.resultadosService.guardarResultado(idUsuario, this.calificacion, tiempo_dedicado).subscribe({
      next: () => console.log('✅ Resultado guardado'),
      error: err => console.error('❌ Error al guardar:', err)
    });
  }
}
