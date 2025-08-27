// DIJU/src/app/servicios/resultados.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { StreakService } from './streak.service'; // Importamos tu StreakService

@Injectable({
  providedIn: 'root'
})
export class ResultadosService {
  private apiUrl = 'http://localhost:3000/resultados';

  // Inyectamos StreakService en el constructor
  constructor(private http: HttpClient, private streakService: StreakService) { }

  /**
   * Guarda el resultado de una actividad en el backend y notifica al StreakService.
   * @param id_usuario El ID del usuario.
   * @param calificacion La calificación obtenida en la actividad.
   * @param tiempo_dedicado El tiempo dedicado en la actividad.
   * @returns Un Observable con la respuesta del backend.
   */
  guardarResultado(id_usuario: number, calificacion: number, tiempo_dedicado: number): Observable<any> {
    const resultado = {
      id_usuario,
      calificacion,
      tiempo_dedicado
    };

    console.log('📤 Enviando resultado:', resultado);

    return this.http.post<any>(this.apiUrl, resultado)
      .pipe(
        // 'tap' ahora recibe la respuesta del backend que contiene la racha
        tap(response => {
          if (response && response.racha) {
            console.log('✅ Resultado guardado correctamente. Racha recibida:', response.racha);
            // Llamamos al método 'notifyActivityCompleted' del StreakService
            // para pasarle los datos de la racha
            this.streakService.notifyActivityCompleted(response.racha.dias_consecutivos, response.racha.is_today_completed);
          } else {
            console.log('✅ Resultado guardado, pero no se recibió la racha.');
          }
        })
      );
  }

  /**
   * Obtiene el progreso del usuario desde el backend.
   * @param id_usuario El ID del usuario.
   * @returns Un Observable con el progreso del usuario.
   */
  getProgresoUsuario(id_usuario: number): Observable<any> {
    return this.http.get<any>(`http://localhost:3000/progreso/${id_usuario}`);
  }
}