import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-foro',
  standalone: false,
  templateUrl: './foro.component.html',
  styleUrl: './foro.component.css'
})
export class ForoComponent {
 isSidebarActive = false;
  topForistas?: Array<{ nombre: string, publicaciones: number }>;
  mensajeExperiencia = '';
  mensajePregunta = '';
 

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.obtenerTopForistas();
  }

  enviarPublicacion() {
    const id_usuario = localStorage.getItem('user_id');
    const contenido = this.mensajeExperiencia.trim() || this.mensajePregunta.trim();

    if (!contenido) {
      alert('No puedes enviar un mensaje vacío.');
      return;
    }
    this.http.post<any>('http://localhost:3000/foro/publicar', {
      id_usuario,
      contenido
    }).subscribe({
      next: () => {
        alert('¡Mensaje enviado!');
        this.mensajeExperiencia = '';
        this.mensajePregunta = '';
        this.obtenerTopForistas();
      },
      error: (err) => {
        console.error('Error al enviar mensaje:', err);
        alert('No se pudo enviar el mensaje. Intenta de nuevo.');
      }
    });
  }

  obtenerTopForistas() {
    this.http.get<any>('http://localhost:3000/foro/top').subscribe({
      next: (data) => {
        this.topForistas = data;
      },
      error: (err) => {
        console.error('Error al obtener ranking:', err);
      }
    });
  }
irAPrincipal() {
  const preferencia = localStorage.getItem('preferencia');
  if (preferencia === 'lectura') {
    this.router.navigate(['/prin-lectura']);
  } else {
    this.router.navigate(['/principal']);
  }
}
irAEjercicio() {
  const preferencia = localStorage.getItem('preferencia');
  if (preferencia === 'lectura') {
    this.router.navigate(['/ejercicios']);
  } else {
    this.router.navigate(['/ejer-matematicas']);
  }
}
  esRutaActivaEjercicio(): boolean {
    const ruta = this.router.url;
    return ruta.includes('ejer-lectura') || ruta.includes('ejer-matematicas');
  }
  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
}
