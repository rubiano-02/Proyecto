import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-configuracion',
  standalone: false,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
})
export class ConfiguracionComponent {
  
  isSidebarActive = false;
  constructor(private router: Router, private http: HttpClient) { }
  mostrarModal = false;
  calificacionSeleccionada = 0;
  estrellas = Array(5).fill(0);

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
  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.calificacionSeleccionada = 0;
  }

  seleccionarCalificacion(valor: number) {
    this.calificacionSeleccionada = valor;
  }

 enviarCalificacion() {
      console.log('▶ enviarCalificacion disparado, calif =', this.calificacionSeleccionada);
  console.log('▶ URL que voy a llamar:', 'http://localhost:3000/foro/calificar');
  const idUsuario = localStorage.getItem('user_id');
  if (!idUsuario) {
    alert('No se encontró el ID de usuario.');
    return;
  }
  if (this.calificacionSeleccionada === 0) {
    alert('Por favor selecciona una calificación.');
    return;
  }
  const data = {
    id_usuario: idUsuario,
    calificacion: this.calificacionSeleccionada,
  };
  this.http.post('/foro/calificar', data)
  .subscribe(
    () => {
      alert('¡Gracias por calificar!');
      this.cerrarModal();
    },
    (error) => {
      console.error('Error enviando calificación:', error);
      alert('Ocurrió un error al enviar la calificación.');
    }
  );
}

}
