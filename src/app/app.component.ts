import { Component, OnInit } from '@angular/core';
import AOS from 'aos';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DIJU';
  constructor(private translate: TranslateService) {
    // Inicializar idioma al cargar la app
    this.translate.setDefaultLang('es');
    this.translate.use('es');
  }
  ngOnInit() {
    if (typeof window !== 'undefined') {
      AOS.init();
    }
  }
}
