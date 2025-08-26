// DIJU/src/app/servicios/exercise-progress.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StreakService } from './streak.service'; // Asegúrate de que esta ruta sea correcta
import { Observable, of } from 'rxjs'; // Necesario para los observables y 'of' para errores controlados

@Injectable({
  providedIn: 'root'
})
export class ExerciseProgressService {

  private apiUrl = 'http://localhost:3000/api/ejercicio-completado'; // Tu endpoint de backend

  constructor(
    private http: HttpClient,
    private streakService: StreakService
  ) { }

  /**
   * Llama a esta función cuando un ejercicio sea completado exitosamente.
   * Actualiza la racha en el frontend y notifica al backend.
   * @param tipoEjercicio 'lectura' o 'matematicas'
   * @returns Observable de la respuesta del backend
   */
  completeExercise(tipoEjercicio: string): Observable<any> {
    const userIdStr = localStorage.getItem('user_id');

    if (!userIdStr) {
      console.warn('No se encontró userId en localStorage. No se puede actualizar la racha ni notificar al backend.');
      // Devuelve un Observable que emite un error para que el suscriptor pueda manejarlo
      return new Observable(observer => {
        observer.error('User ID not found');
        observer.complete();
      });
    }

    const userId = parseInt(userIdStr);

    // 1. Actualizar la racha en el frontend (visualización inmediata)
    this.streakService.completeActivity();
    console.log('Racha actualizada en el frontend por completar ejercicio.');

    // 2. Notificar al backend sobre el ejercicio completado
    return this.http.post(this.apiUrl, { userId: userId, tipoEjercicio: tipoEjercicio });
  }
}