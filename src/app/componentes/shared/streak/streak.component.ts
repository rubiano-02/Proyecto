// DIJU/src/app/componentes/shared/streak/streak.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../../servicios/streak.service';
import { Subscription, Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-streak',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './streak.component.html',
  styleUrls: ['./streak.component.css']
})
export class StreakComponent implements OnInit, OnDestroy {
  currentStreak: number = 0;
  isTodayCompleted: boolean = false;
  showStreakOnAnimation: boolean = false;

  private subscriptions: Subscription = new Subscription();
  private destroy$ = new Subject<void>();

  constructor(private streakService: StreakService) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.streakService.currentStreak$.subscribe(streak => {
        this.currentStreak = streak;
        console.log('StreakComponent: currentStreak actualizado a', streak);
      })
    );

    this.subscriptions.add(
      this.streakService.isTodayCompleted$.subscribe(isCompleted => {
        if (isCompleted && this.currentStreak > 0 && !this.isTodayCompleted) {
          this.triggerStreakAnimation();
        }
        this.isTodayCompleted = isCompleted;
        console.log('StreakComponent: isTodayCompleted actualizado a', isCompleted);
      })
    );
  }

  isStreakActive(): boolean {
    return this.currentStreak > 0;
  }

  private triggerStreakAnimation(): void {
    this.showStreakOnAnimation = true;
    console.log('Disparando animación de racha ON.');
    timer(1500).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.showStreakOnAnimation = false;
      console.log('Animación de racha ON finalizada.');
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}