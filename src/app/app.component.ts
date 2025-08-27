import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { TranslateService } from '@ngx-translate/core';
import { StreakService } from './servicios/streak.service'; // 1. Importar el servicio de racha
import { Router, NavigationEnd } from '@angular/router'; // 2. Importar el Router y NavigationEnd

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DIJU';

  // 3. Inyectar el StreakService y el Router en el constructor para poder usarlos
  constructor(
    private translate: TranslateService,
    private streakService: StreakService,
    private router: Router
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      AOS.init();
    }

    // 4. Llama al servicio de racha una vez al iniciar la aplicación.
    // Esto se asegura de que la racha se cargue desde el momento en que se inicia la app.
    const userIdFromStorage = localStorage.getItem('user_id');
    if (userIdFromStorage) {
      this.streakService.getStreak(+userIdFromStorage);
    }

    // 5. Suscribirse a los cambios de ruta. Esto es crucial para que la racha
    // se actualice si el usuario navega a otra página y luego regresa.
    this.router.events.subscribe(event => {
      // Solo actúa cuando la navegación ha terminado con éxito
      if (event instanceof NavigationEnd) {
        const currentUserId = localStorage.getItem('user_id');
        if (currentUserId) {
          this.streakService.getStreak(+currentUserId);
        }
      }
    });
  }
}
