// DIJU/src/app/servicios/streak.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  private _currentStreak: BehaviorSubject<number>;
  public currentStreak$: Observable<number>;

  private _isTodayCompleted: BehaviorSubject<boolean>;
  public isTodayCompleted$: Observable<boolean>;

  private apiBaseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {
    // 1. Al iniciar el servicio, intentamos cargar la racha desde localStorage.
    // Si no existe, usamos 0 como valor inicial.
    const savedStreak = localStorage.getItem('currentStreak');
    const initialStreak = savedStreak ? parseInt(savedStreak, 10) : 0;

    const savedIsCompleted = localStorage.getItem('isTodayCompleted');
    const initialIsCompleted = savedIsCompleted === 'true';

    this._currentStreak = new BehaviorSubject<number>(initialStreak);
    this._isTodayCompleted = new BehaviorSubject<boolean>(initialIsCompleted);

    this.currentStreak$ = this._currentStreak.asObservable();
    this.isTodayCompleted$ = this._isTodayCompleted.asObservable();
  }

  /**
   * Obtiene la racha del usuario desde el backend y la actualiza
   * tanto en el servicio como en el localStorage.
   * Se debe llamar al iniciar sesión o al cargar el componente principal.
   * @param userId El ID del usuario.
   */
  public getStreak(userId: number): void {
    this.http.get<any>(`${this.apiBaseUrl}/api/racha-usuario/${userId}`).subscribe({
      next: (response) => {
        if (response.success && response.racha) {
          const newStreak = response.racha.dias_consecutivos;
          const newIsCompleted = response.racha.is_today_completed;
          this._currentStreak.next(newStreak);
          this._isTodayCompleted.next(newIsCompleted);

          // 2. Guardamos la racha y el estado en localStorage
          localStorage.setItem('currentStreak', newStreak.toString());
          localStorage.setItem('isTodayCompleted', newIsCompleted.toString());
        } else {
          // Si no hay racha, la inicializa en 0 y la guarda.
          this._currentStreak.next(0);
          this._isTodayCompleted.next(false);
          localStorage.setItem('currentStreak', '0');
          localStorage.setItem('isTodayCompleted', 'false');
        }
        console.log('StreakService: Racha obtenida del backend y guardada:', this._currentStreak.getValue());
      },
      error: (err: any) => {
        console.error('Error al obtener la racha del backend:', err);
        // Si hay un error, se mantiene el valor que está en localStorage
      }
    });
  }

  /**
   * Este método es llamado por el ResultadosService para notificar
   * la racha actualizada y la guarda en localStorage.
   * @param dias_consecutivos La cantidad de días de racha.
   * @param is_today_completed Si el día de hoy ya se ha completado.
   */
  public notifyActivityCompleted(dias_consecutivos: number, is_today_completed: boolean): void {
    this._currentStreak.next(dias_consecutivos);
    this._isTodayCompleted.next(is_today_completed);

    // 3. Guardamos la racha y el estado en localStorage
    localStorage.setItem('currentStreak', dias_consecutivos.toString());
    localStorage.setItem('isTodayCompleted', is_today_completed.toString());
    console.log('StreakService: Notificación recibida. Racha actualizada y guardada:', dias_consecutivos);
  }
}
