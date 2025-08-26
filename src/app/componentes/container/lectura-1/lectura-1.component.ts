import { Component } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { ResultadosService } from '@servicios/resultados.service';
import * as AOS from 'aos';
import { ChangeDetectorRef } from '@angular/core';
import {  AfterViewInit } from '@angular/core';
@Component({
  selector: 'app-lectura-1',
  standalone: false,
  templateUrl: './lectura-1.component.html',
  styleUrl: './lectura-1.component.css'
})
export class Lectura1Component {
  opciones = ['cama', 'sol', 'ratón'];
  respuestas: (string | null)[] = [null, null, null];
  correctas = ['cama', 'sol', 'ratón'];
  animar = [false, false, false];
  mensaje = '';
  mostrarContenido = false;
  modalAbierto: boolean = false;

  abrirModal() {
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mostrarContenido = true;
    }, 0);
  }

  color = '';
  calificacion = 5;
  intentosFallidos: number = 0;
  ejercicioActual: number = 1;
  totalEjercicios: number = 5;
  aciertos: number = 0;
  terminado: boolean = false;

  constructor(private resultadosService: ResultadosService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdRef.detectChanges();
  }

  soltar(event: CdkDragDrop<any>, index?: number) {
    if (index === undefined || index < 0 || index > 2) return;
    if (event.previousContainer === event.container) return;

    const item = event.previousContainer.data[event.previousIndex];

    if (!this.respuestas[index]) {
      this.respuestas[index] = item;
      event.previousContainer.data.splice(event.previousIndex, 1);

      this.animar[index] = false;
      setTimeout(() => this.animar[index] = true, 10);
    }
  }

  insertarPorClick(opcion: string, i: number) {
    const index = this.respuestas.findIndex(r => r === null);
    if (index !== -1) {
      this.animar[index] = false;
      this.respuestas[index] = opcion;
      this.opciones.splice(i, 1);
      setTimeout(() => this.animar[index] = true, 10);
    }
  }

  sacarDelCajon(index: number) {
    if (this.respuestas[index]) {
      this.opciones.push(this.respuestas[index]!);
      this.respuestas[index] = null;
    }
  }

  verificar() {
    const palabraCorrecta = ['cama', 'sol', 'ratón'];

    const esCorrecto = this.respuestas.length === palabraCorrecta.length &&
                       this.respuestas.every((r, i) => r === palabraCorrecta[i]);

    if (this.respuestas.includes(null)) {
      this.mensaje = 'Debes completar todas las palabras. 📌';
      this.color = 'orange';
      return;
    }

    if (esCorrecto) {
      this.mensaje = `✔ Correcto`;
      this.color = 'green';
      this.terminado = true;
      this.guardarResultado();
    } else {
      this.intentosFallidos++;
      this.calificacion = Math.max(0, 5 - this.intentosFallidos);
      this.mensaje = `❌ Solución correcta: cama, sol, ratón`;
      this.color = 'red';

      if (this.intentosFallidos >= 5) {
        this.terminado = true;
        this.guardarResultado();
      }
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
      next: (response: any) => {
        console.log('✅ Resultado guardado correctamente:', response);
      },
      error: (error: any) => {
        console.error('❌ Error al guardar resultado:', error);
      }
    });
  }

}
