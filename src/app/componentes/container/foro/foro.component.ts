import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-foro',
  standalone: false,
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css'
})
export class ForoComponent {
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
