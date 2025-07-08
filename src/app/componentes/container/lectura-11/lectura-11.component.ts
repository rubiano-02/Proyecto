import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';  
@Component({
  selector: 'app-lectura-11',
  standalone: false,
  templateUrl: './lectura-11.component.html',
  styleUrl: './lectura-11.component.css'
})
export class Lectura11Component {
 texto = 'El perro corrió tras la pelota.';
  afirmaciones = [
    { texto: 'El perro voló.', respuesta: null, correcto: null, solucion: false },
    { texto: 'Había una pelota.', respuesta: null, correcto: null, solucion: true }
  ];

  mensaje = '';
  terminado = false;
  calificacion = 5;
  totalEjercicios = 5;

  constructor(private resultadosService: ResultadosService) {}

  seleccionar(afirm: any, valor: boolean) {
    afirm.respuesta = valor;
    afirm.correcto = afirm.respuesta === afirm.solucion;
  }

  verificar() {
    const incompletas = this.afirmaciones.some(a => a.respuesta === null);
    if (incompletas) {
      this.mensaje = 'Responde todas las afirmaciones.';
      return;
    }

    const correctas = this.afirmaciones.filter(a => a.correcto).length;
    this.calificacion = Math.round((correctas / this.afirmaciones.length) * this.totalEjercicios);
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
      error: err => console.error('❌ Error al guardar resultado', err)
    });
  }
}
