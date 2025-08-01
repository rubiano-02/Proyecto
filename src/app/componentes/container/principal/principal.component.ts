// src/app/componentes/container/principal/principal.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { ResultadosService } from '../../../servicios/resultados.service';
import { Subscription, interval } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

// --- NUEVAS IMPORTACIONES PARA LA RACHA ---
import { StreakService } from '../../../servicios/streak.service'; // Import the streak service
import { StreakComponent } from '../../shared/streak/streak.component'; // Import the streak component
// ------------------------------------------

@Component({
  selector: 'app-principal',
  standalone: true,
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    StreakComponent // <-- ADD THIS HERE for the streak component to work!
  ]
})
export class PrincipalComponent implements OnInit, OnDestroy {
  isSidebarActive = false;

  // Statistics Data
  progresoGeneral: number = 0;
  puntaje: number = 0;
  tiempo: number = 0;

  // Animated Statistics Data
  progresoGeneralAnimado: number = 0;
  puntajeAnimado: number = 0;
  tiempoAnimado: number = 0;

  // Challenge Data
  desafios: any[] = [];
  userId: number | null = null;
  private refreshSubscription: Subscription | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private resultadosService: ResultadosService,
    private streakService: StreakService // <-- INJECT THE STREAK SERVICE HERE!
  ) { }

  ngOnInit(): void {
    const userIdFromStorage = localStorage.getItem('user_id');
    if (userIdFromStorage) {
      this.userId = +userIdFromStorage;

      this.http.get<any>(`http://localhost:3000/progreso/${this.userId}`).subscribe({
        next: (data) => {
          this.progresoGeneral = data.progreso_general || 0;
          this.puntaje = data.puntaje_promedio || 0;
          this.tiempo = Math.min(100, Math.floor((data.tiempo_total / 60) * 100 / 5));
          this.animarBarras();
        },
        error: (err) => console.error('Error al obtener progreso de estadísticas:', err)
      });

      this.cargarDesafios();

      this.refreshSubscription = interval(10000).subscribe(() => {
        this.cargarDesafios();
      });

    } else {
      console.warn('No se encontró userId en localStorage. No se cargarán estadísticas ni desafíos.');
    }
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  animarBarras(): void {
    let frame = 0;
    const pasos = 60;
    const velocidad = 10;

    const intervalo = setInterval(() => {
      frame++;

      this.progresoGeneralAnimado = Math.min(this.progresoGeneral, (this.progresoGeneral * frame) / pasos);
      this.puntajeAnimado = Math.min(this.puntaje, (this.puntaje * frame) / pasos);
      this.tiempoAnimado = Math.min(this.tiempo, (this.tiempo * frame) / pasos);

      if (frame >= pasos) clearInterval(intervalo);
    }, velocidad);
  }

  cargarDesafios(): void {
    if (this.userId === null) {
      console.warn('No hay userId para cargar desafíos.');
      return;
    }
    this.http.get<any[]>(`http://localhost:3000/desafios-progreso/${this.userId}`).subscribe(
      data => {
        this.desafios = data;
        console.log('FRONTEND (PrincipalComponent): Desafíos y progreso cargados:', this.desafios);
      },
      error => {
        console.error('FRONTEND (PrincipalComponent): Error al cargar desafíos:', error);
      }
    );
  }

  getDesafioByMetrica(metrica: string, objetivo?: number): any {
    if (objetivo) {
      return this.desafios.find(d => d.metrica_seguimiento === metrica && d.valor_objetivo === objetivo);
    }
    return this.desafios.find(d => d.metrica_seguimiento === metrica);
  }

  getProgresoPorcentaje(desafio: any): number {
    if (!desafio || desafio.valor_objetivo === 0) {
      return 0;
    }
    return Math.min(100, (desafio.progreso_actual / desafio.valor_objetivo) * 100);
  }

  getProgresoTexto(desafio: any): string {
    if (!desafio) {
      return 'N/A';
    }
    return `${desafio.progreso_actual}/${desafio.valor_objetivo}`;
  }

  isDesafioCompletado(desafio: any): boolean {
    return desafio && desafio.completado;
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  opcionSeleccionada = 'Lectura';
  iconoSeleccionado = 'assets/Images/Libro.png';
  mostrarOpciones = false;

  cambiarOpcion(opcion: string, icono: string) {
    this.opcionSeleccionada = opcion;
    this.iconoSeleccionado = icono;
    this.mostrarOpciones = false;

    if (opcion === 'Matemáticas') {
      this.router.navigate(['/ejer-matematicas']);
    } else if (opcion === 'Lectura') {
      this.router.navigate(['/prin-lectura']);
    }
  }

  // --- NEW METHOD TO CALL THE STREAK SERVICE ---
  // This method should be invoked when the user COMPLETES an exercise successfully.
  // It is crucial that you call it from the logic that confirms the completion of an activity.
  // For example, when submitting a final correct answer, or finishing a lesson.
  public completarEjercicioYActualizarRacha(): void {
    console.log('Exercise completion detected. Updating streak...');
    this.streakService.completeActivity(); // This updates the streak in the service
    // The StreakComponent will automatically react and animate.
  }

  // You can add a temporary button in your HTML to test this function:
  // <button (click)="completarEjercicioYActualizarRacha()">Completar Ejercicio</button>
}