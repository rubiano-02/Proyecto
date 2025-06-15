import { Component, OnInit } from '@angular/core';
import { ResultadosService } from '/Proyecto/DIJU/src/app/servicios/resultados.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-principal',
  standalone: false,
  templateUrl: './principal.component.html',
  styleUrl: './principal.component.css'
})
export class PrincipalComponent implements OnInit {
  isSidebarActive = false;

  // Datos sin animación
  progresoGeneral: number = 0;
  puntaje: number = 0;
  tiempo: number = 0;

  // Datos animados
  progresoGeneralAnimado: number = 0;
  puntajeAnimado: number = 0;
  tiempoAnimado: number = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      this.http.get<any>(`http://localhost:3000/progreso/${userId}`).subscribe({
        next: (data) => {
          // Guardar datos
          this.progresoGeneral = data.progreso_general || 0;
          this.puntaje = data.puntaje_promedio || 0;

          // Convertir tiempo a porcentaje (ajústalo según tu lógica)
          this.tiempo = Math.min(100, Math.floor((data.tiempo_total / 60) * 100 / 5));

          // Animar las barras
          this.animarBarras();
        },
        error: (err) => console.error('Error al obtener progreso:', err)
      });
    }
  }

  animarBarras(): void {
    let frame = 0;
    const pasos = 60;
    const velocidad = 10;

    const intervalo = setInterval(() => {
      frame++;

      this.progresoGeneralAnimado = Math.min(this.progresoGeneral, (this.progresoGeneral * frame) / pasos);
      this.puntajeAnimado = Math.min(this.puntaje, (this.puntaje * frame) / pasos);
      this.tiempoAnimado = Math.min(this.tiempo, (this.tiempo * frame) / pasos);

      if (frame >= pasos) clearInterval(intervalo);
    }, velocidad);
  }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
}
