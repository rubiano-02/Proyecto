import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
})
export class ConfiguracionComponent {
  isSidebarActive = false;
  constructor(private router: Router) {}
irAPrincipal() {
  const preferencia = localStorage.getItem('preferencia');
  if (preferencia === 'lectura') {
    this.router.navigate(['/prin-lectura']);
  } else {
    this.router.navigate(['/principal']);
  }
}
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
}
