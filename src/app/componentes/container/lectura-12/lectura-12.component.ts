import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';  
@Component({
  selector: 'app-lectura-12',
  standalone: false,
  templateUrl: './lectura-12.component.html',
  styleUrl: './lectura-12.component.css'
})
export class Lectura12Component {
frases = [
  { texto: "¡Vamos al parque antes de que oscurezca!", personaje: "Sofía", bloqueado: false },
  { texto: "¿Y si llueve? No quiero mojarme otra vez", personaje: "Leo", bloqueado: false },
  { texto: "Llevamos paraguas por si acaso", personaje: "Sofía", bloqueado: false },
  { texto: "Esta vez tú cargas el paraguas", personaje: "Leo", bloqueado: false }
];


  personajes = ['Sofía', 'Leo'];
  respuestas: (string | null)[] = [null, null];

  mensaje = '';
  terminado = false;
  calificacion = 5;
  totalEjercicios = 5;

  constructor(private resultadosService: ResultadosService) {}

modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  seleccionar(index: number, personaje: string) {
    this.respuestas[index] = personaje;
  }

  verificar() {
    if (this.respuestas.includes(null)) {
      this.mensaje = 'Responde todas las frases antes de verificar.';
      return;
    }

    let correctas = 0;
    this.frases.forEach((frase, i) => {
      frase.bloqueado = true;
      if (this.respuestas[i] === frase.personaje) correctas++;
    });

    this.calificacion = Math.round((correctas / this.frases.length) * this.totalEjercicios);
    this.mensaje = this.calificacion === 5 ? '✔ ¡Correcto!' : 'Casi. ¡Corrige!';
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
      error: err => console.error('❌ Error al guardar', err)
    });
  }
}
