import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../../servicios/streak.service';
import { Subscription, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core'; // Asumiendo que usas ngx-translate

@Component({
  selector: 'app-streak',
  standalone: true,
  imports: [CommonModule, TranslateModule], // Asegúrate de importar CommonModule y TranslateModule
  templateUrl: './streak.component.html',
  styleUrls: ['./streak.component.css']
})
export class StreakComponent implements OnInit, OnDestroy {
  currentStreak: number = 0;
  isStreakActive: boolean = false;
  isTodayCompleted: boolean = false; // Indica si la actividad de hoy ya se completó
  
  // Bandera para controlar cuándo mostrar la imagen de "Racha-On" y aplicar la animación
  showStreakOnAnimation: boolean = false;

  private subscriptions: Subscription = new Subscription();
  private destroy$ = new Subject<void>(); // Para desuscribirse de todos los observables al destruir el componente

  constructor(private streakService: StreakService) { }

  ngOnInit(): void {
    // Suscribirse a los observables del StreakService
    this.subscriptions.add(
      this.streakService.currentStreak$.subscribe(streak => {
        this.currentStreak = streak;
        console.log('StreakComponent: currentStreak actualizado a', streak);
      })
    );

    this.subscriptions.add(
      this.streakService.isStreakActive$.subscribe(isActive => {
        this.isStreakActive = isActive;
        console.log('StreakComponent: isStreakActive actualizado a', isActive);
      })
    );

    this.subscriptions.add(
      this.streakService.isTodayCompleted$.subscribe(isCompleted => {
        // Cuando isTodayCompleted cambia a true y la racha está activa, disparamos la animación.
        // Esto cubre el caso de una nueva racha o de completar la actividad diaria.
        if (isCompleted && this.isStreakActive && !this.isTodayCompleted) { // Solo si cambia a true y no estaba ya true
          this.triggerStreakAnimation();
        }
        this.isTodayCompleted = isCompleted;
        console.log('StreakComponent: isTodayCompleted actualizado a', isCompleted);
      })
    );
  }

  // Este método es llamado internamente por la suscripción a isTodayCompleted$
  private triggerStreakAnimation(): void {
    this.showStreakOnAnimation = true;
    console.log('Disparando animación de racha ON.');
    // Ocultar la imagen "On" después de un breve período (ej. 1.5 segundos)
    timer(1500).pipe(
      takeUntil(this.destroy$) // Asegura que el timer se cancela si el componente se destruye
    ).subscribe(() => {
      this.showStreakOnAnimation = false;
      console.log('Animación de racha ON finalizada.');
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Desuscribirse de todos los BehaviorSubjects
    this.destroy$.next();
    this.destroy$.complete();
  }
}