import { Component } from '@angular/core';
import { ResultadosService } from '@servicios/resultados.service';

@Component({
  selector: 'app-lectura-8',
  templateUrl: './lectura-8.component.html',
  styleUrl: './lectura-8.component.css',
  standalone: false  
})
export class Lectura8Component {
   palabrasBase = ['alegre', 'rápido', 'enojado', 'grande'];
  sinonimos = ['contento', 'veloz', 'molesto', 'enorme'];
  emparejados: { base: string, sinonimo: string }[] = [];
  seleccionando: string | null = null;

  mensaje = '';
  terminado = false;
  calificacion = 5;
  totalEjercicios = 5;
modalAbierto: boolean = false;

abrirModal() {
  this.modalAbierto = true;
}

cerrarModal() {
  this.modalAbierto = false;
}
  constructor(private resultadosService: ResultadosService) {
    this.sinonimos = this.mezclarArray(this.sinonimos);
  }

  seleccionarPalabraBase(base: string) {
    this.seleccionando = base;
  }

  seleccionarSinonimo(sinonimo: string) {
    if (this.seleccionando) {
      this.emparejados.push({ base: this.seleccionando, sinonimo });
      this.palabrasBase = this.palabrasBase.filter(p => p !== this.seleccionando);
      this.sinonimos = this.sinonimos.filter(s => s !== sinonimo);
      this.seleccionando = null;

      if (this.palabrasBase.length === 0) this.verificar();
    }
  }

  verificar() {
    const correctos = [
      { base: 'alegre', sinonimo: 'contento' },
      { base: 'enojado', sinonimo: 'molesto' },
      { base: 'grande', sinonimo: 'enorme' },
       
      

    ];

    const aciertos = this.emparejados.filter(p =>
      correctos.some(c => c.base === p.base && c.sinonimo === p.sinonimo)
    ).length;

    this.calificacion = aciertos * 5 / correctos.length;
    this.mensaje = aciertos === correctos.length
      ? '✔ ¡Perfecto! Todos los sinónimos correctos.'
      : `Casi. ¡Corrige!`;

    this.terminado = true;
    this.guardarResultado();
  }

  mezclarArray(array: string[]): string[] {
    return array.sort(() => Math.random() - 0.5);
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
