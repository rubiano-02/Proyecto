// DIJU/src/app/servicios/streak.service.ts
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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

  // Inyectamos PLATFORM_ID para detectar si estamos en el navegador
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    let initialStreak = 0;
    let initialIsCompleted = false;

    // Verificamos si el código se está ejecutando en el navegador
    if (isPlatformBrowser(this.platformId)) {
      // Si es un navegador, accedemos a localStorage de forma segura
      const savedStreak = localStorage.getItem('currentStreak');
      initialStreak = savedStreak ? parseInt(savedStreak, 10) : 0;
      const savedIsCompleted = localStorage.getItem('isTodayCompleted');
      initialIsCompleted = savedIsCompleted === 'true';
    }

    this._currentStreak = new BehaviorSubject<number>(initialStreak);
    this._isTodayCompleted = new BehaviorSubject<boolean>(initialIsCompleted);

    this.currentStreak$ = this._currentStreak.asObservable();
    this.isTodayCompleted$ = this._isTodayCompleted.asObservable();
  }

  /**
   * Obtiene la racha del usuario desde el backend y la actualiza.
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

          // Guardamos en localStorage solo si estamos en el navegador
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentStreak', newStreak.toString());
            localStorage.setItem('isTodayCompleted', newIsCompleted.toString());
          }
        } else {
          this._currentStreak.next(0);
          this._isTodayCompleted.next(false);
          // Guardamos en localStorage solo si estamos en el navegador
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentStreak', '0');
            localStorage.setItem('isTodayCompleted', 'false');
          }
        }
        console.log('StreakService: Racha obtenida del backend y guardada:', this._currentStreak.getValue());
      },
      error: (err: any) => {
        console.error('Error al obtener la racha del backend:', err);
      }
    });
  }

  /**
   * Este método es llamado por el ResultadosService para notificar
   * la racha actualizada.
   * @param dias_consecutivos La cantidad de días de racha.
   * @param is_today_completed Si el día de hoy ya se ha completado.
   */
  public notifyActivityCompleted(dias_consecutivos: number, is_today_completed: boolean): void {
    this._currentStreak.next(dias_consecutivos);
    this._isTodayCompleted.next(is_today_completed);

    // Guardamos en localStorage solo si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentStreak', dias_consecutivos.toString());
      localStorage.setItem('isTodayCompleted', is_today_completed.toString());
    }
    console.log('StreakService: Notificación recibida. Racha actualizada y guardada:', dias_consecutivos);
  }
}
