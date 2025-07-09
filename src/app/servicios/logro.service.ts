// DIJU/src/app/servicios/logro.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define la interfaz para un Logro, similar a tus desafíos
export interface Logro {
  id: number;
  nombre: string;
  descripcion: string;
  metrica: string; // e.g., 'ejercicios_completados_total', 'dias_consecutivos', 'calificacion_90_plus'
  objetivo: number; // El valor a alcanzar para completar el logro
  progreso_actual: number; // El progreso actual del usuario para esta métrica
  icono_url: string; // URL al ícono del logro (ej: 'assets/Images/Objetivo.png')
  completado: boolean; // true si progreso_actual >= objetivo
  color_barra?: string; // Opcional: para dar un color específico a la barra (ej: 'rojo', 'azul', 'naranja')
}

@Injectable({
  providedIn: 'root'
})
export class LogroService {
  // Hardcodea la URL del backend aquí, ya que no tienes archivo environment
  private backendUrl = 'http://localhost:3000'; // ¡Ajusta esto si tu backend no está en 3000!
  private apiUrl = this.backendUrl + '/api/logros'; 

  constructor(private http: HttpClient) { }

  /**
   * Obtiene los logros de un usuario específico desde el backend.
   * Tu backend deberá tener un endpoint que, dado un user_id,
   * devuelva la lista de logros con el progreso actual del usuario para cada uno.
   *
   * Ejemplo de cómo podría responder tu backend para /api/logros/usuario/{userId}:
   * [
   * { id: 1, nombre: "Maestro de las Sumas", descripcion: "Completa 10 ejercicios de sumas", metrica: "ejercicios_matematicas_completados", objetivo: 10, progreso_actual: 7, icono_url: "assets/Images/SumasMaestro.png", completado: false, color_barra: "verde" },
   * { id: 2, nombre: "Lector Pro", descripcion: "Completa 5 ejercicios de lectura", metrica: "ejercicios_lectura_completados", objetivo: 5, progreso_actual: 5, icono_url: "assets/Images/LectorPro.png", completado: true, color_barra: "azul" },
   * { id: 3, nombre: "Racha Perfecta", descripcion: "Inicia sesión 7 días consecutivos", metrica: "dias_consecutivos", objetivo: 7, progreso_actual: 3, icono_url: "assets/Images/Fuego.png", completado: false, color_barra: "naranja" }
   * ]
   */
  obtenerLogrosUsuario(userId: number): Observable<Logro[]> {
    return this.http.get<Logro[]>(`${this.apiUrl}/usuario/${userId}`);
  }
}
