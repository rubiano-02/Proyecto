import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

@Component({
  selector: 'app-lectura-10',
  standalone: false,
  templateUrl: './lectura-10.component.html',
  styleUrls: ['./lectura-10.component.css'],
  animations: [
    trigger('desaparecer', [
      state('visible', style({ opacity: 1, transform: 'scale(1)' })),
      state('oculto', style({ opacity: 0, transform: 'scale(0.9)' })),
      transition('visible => oculto', [
        animate('300ms ease-out')
      ])
    ])
  ]
})
export class Lectura10Component {
 causas = ['Llovió mucho', 'No estudió', 'Comió en exceso', 'Se pinchó la llanta', 'Se quedó despierto'];
  efectos = ['El patio se inundó', 'Reprobó el examen', 'Tuvo dolor de estómago', 'Tuvo que caminar', 'Tuvo sueño al día siguiente'];
seleccionEfecto: string | null = null;
desapareciendo = new Set<string>();
shuffle(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
ngOnInit() {
  this.shuffle(this.efectos);
}

  relacionesCorrectas: { [causa: string]: string } = {
    'Llovió mucho': 'El patio se inundó',
    'No estudió': 'Reprobó el examen',
    'Comió en exceso': 'Tuvo dolor de estómago',
    'Se pinchó la llanta': 'Tuvo que caminar',
    'Se quedó despierto': 'Tuvo sueño al día siguiente'
  };

  seleccionCausa: string | null = null;
  relacionesUsuario: { [causa: string]: string } = {};
  efectosUsados: string[] = [];
  colores: { [causa: string]: string } = {};

  mensaje = '';
  calificacion = 5;
  terminado = false;
  totalEjercicios = 5;
  colorIndex = 0;
  coloresDisponibles = ['#dcedc8', '#f8bbd0', '#b3e5fc', '#ffe082', '#c5cae9'];

  constructor(private resultadosService: ResultadosService) {}

  seleccionarCausa(causa: string): void {
    if (this.relacionesUsuario[causa]) return;
    this.seleccionCausa = causa;
  }

  seleccionarEfecto(efecto: string): void {
    if (!this.seleccionCausa || this.efectosUsados.includes(efecto)) return;

    this.relacionesUsuario[this.seleccionCausa] = efecto;
    this.efectosUsados.push(efecto);
    this.colores[this.seleccionCausa] = this.coloresDisponibles[this.colorIndex++ % this.coloresDisponibles.length];
    this.seleccionCausa = null;
  }

  verificar(): void {
    const correctas = Object.entries(this.relacionesCorrectas).filter(
      ([causa, efecto]) => this.relacionesUsuario[causa] === efecto
    ).length;

    this.calificacion = Math.round((correctas / this.totalEjercicios) * 5);

    this.mensaje = correctas === this.totalEjercicios
      ? '✔ ¡Muy bien! Todas las relaciones son correctas.'
      : `¡Intenta de nuevo!`;

    this.terminado = true;
    this.guardarResultado();
  }

  guardarResultado(): void {
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
