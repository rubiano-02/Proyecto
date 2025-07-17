import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Esto hace que el servicio sea un singleton y esté disponible en toda la app
})
export class StreakService {
  // BehaviorSubject para que los componentes puedan suscribirse a los cambios de la racha
  private _currentStreak = new BehaviorSubject<number>(0);
  public currentStreak$: Observable<number> = this._currentStreak.asObservable();

  private _isStreakActive = new BehaviorSubject<boolean>(false);
  public isStreakActive$: Observable<boolean> = this._isStreakActive.asObservable();

  private _isTodayCompleted = new BehaviorSubject<boolean>(false);
  public isTodayCompleted$: Observable<boolean> = this._isTodayCompleted.asObservable();

  // Almacena la última fecha de completado para verificar la continuidad de la racha
  private lastCompletionDate: string | null = null; // Formato 'YYYY-MM-DD'

  constructor() {
    // Al iniciar el servicio, carga los datos guardados y verifica el estado actual de la racha
    this.loadStreakData();
    this.checkStreakStatus();
  }

  /**
   * Carga los datos de la racha desde localStorage.
   */
  private loadStreakData(): void {
    // Verifica si localStorage está disponible (importante para SSR o entornos sin navegador)
    if (typeof localStorage !== 'undefined') {
      const streak = localStorage.getItem('userGlobalStreak');
      const lastDate = localStorage.getItem('lastGlobalCompletionDate');

      if (streak) {
        this._currentStreak.next(parseInt(streak, 10)); // Actualiza el BehaviorSubject con la racha cargada
      }
      this.lastCompletionDate = lastDate;
    }
  }

  /**
   * Guarda los datos actuales de la racha en localStorage.
   */
  private saveStreakData(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('userGlobalStreak', this._currentStreak.getValue().toString());
      localStorage.setItem('lastGlobalCompletionDate', this.lastCompletionDate || '');
    }
  }

  /**
   * Verifica el estado de la racha comparando la fecha actual con la última fecha de completado.
   * Reinicia la racha si no se ha completado una actividad en el día correcto.
   */
  private checkStreakStatus(): void {
    const today = this.getFormattedDate(new Date());

    // Si no hay fecha de última actividad, la racha no está activa
    if (!this.lastCompletionDate) {
      this._isStreakActive.next(false);
      this._isTodayCompleted.next(false);
      this._currentStreak.next(0); // Asegura que la racha esté en 0
      this.saveStreakData(); // Guarda el estado reiniciado
      return;
    }

    const lastDateObj = new Date(this.lastCompletionDate);
    const todayObj = new Date(today);

    // Calcula la diferencia en días (ignorando la hora para evitar problemas de zonas horarias)
    const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Si la última actividad fue hoy, la racha está activa y la actividad de hoy ya está hecha
      this._isStreakActive.next(true);
      this._isTodayCompleted.next(true);
    } else if (diffDays === 1) {
      // Si la última actividad fue ayer, la racha está activa pero la de hoy NO está hecha
      this._isStreakActive.next(true);
      this._isTodayCompleted.next(false);
    } else {
      // Si han pasado más de un día desde la última actividad, la racha se rompe
      this._isStreakActive.next(false);
      this._isTodayCompleted.next(false);
      this._currentStreak.next(0); // Reiniciar racha a 0
      this.saveStreakData(); // Guarda la racha reiniciada
    }
  }

  /**
   * Método público para que los componentes llamen cuando el usuario completa cualquier actividad.
   * @returns boolean True si la racha se incrementó o inició, false si ya se había completado hoy.
   */
  public completeActivity(): boolean {
    const today = this.getFormattedDate(new Date());

    // Si la actividad de hoy ya está completada, no hacemos nada y no disparamos animación
    if (this._isTodayCompleted.getValue()) {
      console.log('Actividad de hoy ya completada. Vuelve mañana para seguir la racha.');
      return false;
    }

    let newStreakValue = this._currentStreak.getValue();
    let streakIncreasedOrStarted = false; // Bandera para indicar si la racha avanzó o se inició

    // Lógica para determinar si la racha debe incrementarse o reiniciarse
    if (this._isStreakActive.getValue() && this.lastCompletionDate) {
      const lastDateObj = new Date(this.lastCompletionDate);
      const todayObj = new Date(today);
      const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        newStreakValue++; // Incrementa la racha si la última actividad fue ayer
        streakIncreasedOrStarted = true;
      } else if (diffDays > 1) {
        newStreakValue = 1; // La racha se rompió, inicia una nueva
        streakIncreasedOrStarted = true;
      }
      // Si diffDays es 0, no entra aquí porque isTodayCompleted sería true al inicio del método
    } else {
      // Si la racha no estaba activa (primera vez o se rompió), empieza una nueva racha
      newStreakValue = 1;
      streakIncreasedOrStarted = true;
    }

    // Actualiza los BehaviorSubject y la fecha de última actividad
    this._currentStreak.next(newStreakValue);
    this.lastCompletionDate = today;
    this._isTodayCompleted.next(true);
    this._isStreakActive.next(true);

    // Guarda los datos actualizados en localStorage
    this.saveStreakData();

    console.log(`Racha global actualizada: ${this._currentStreak.getValue()} días.`);
    return streakIncreasedOrStarted; // Devuelve si la racha se incrementó/inició para disparar la animación
  }

  /**
   * Método de utilidad para obtener la fecha en formato 'YYYY-MM-DD'.
   * @param date La fecha a formatear.
   * @returns string La fecha formateada.
   */
  private getFormattedDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses son 0-11, por eso +1
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}