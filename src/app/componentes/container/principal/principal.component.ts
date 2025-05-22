import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-principal',
  standalone: false,
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent {
  isSidebarActive = false;

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
}
