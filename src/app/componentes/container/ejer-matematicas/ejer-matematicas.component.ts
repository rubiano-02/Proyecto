import { Component } from '@angular/core';

@Component({
  selector: 'app-ejer-matematicas',
  standalone: false,
  templateUrl: './ejer-matematicas.component.html',
  styleUrl: './ejer-matematicas.component.css'
})
export class EjerMatematicasComponent {
isSidebarActive = false;

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
}
