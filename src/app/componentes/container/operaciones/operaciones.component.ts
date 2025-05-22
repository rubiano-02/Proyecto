import { Component } from '@angular/core';

@Component({
  selector: 'app-operaciones',
  standalone: false,
  templateUrl: './operaciones.component.html',
  styleUrl: './operaciones.component.css'
})
export class OperacionesComponent {
  numero1: number = 0;
  numero2: number = 2;
  resultado: number = 0;
  operacion: string = '+';
  calcular() {
    if (this.operacion === '+') {

      this.numero1 + this.numero2
    } else if (this.operacion === '-') {
      this.numero1 - this.numero2
    }
  }


} 