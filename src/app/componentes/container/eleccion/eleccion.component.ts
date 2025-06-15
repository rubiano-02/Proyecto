import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-eleccion',
  standalone: false,
  templateUrl: './eleccion.component.html',
  styleUrl: './eleccion.component.css'
})
export class EleccionComponent {
constructor(private http: HttpClient, private router: Router) {}

  elegirPreferencia(tipo: 'lectura' | 'matematicas') {
    const id = localStorage.getItem('user_id');
    if (!id) {
      alert('No se encontró ID de usuario');
      return;
    }

    this.http.put(`http://localhost:3000/usuarios/${id}/preferencia`, {
      tipo_ejercicio_preferido: tipo
    }).subscribe({
      next: () => {
        const ruta = tipo === 'lectura' ? '/prin-lectura' : '/principal';
        this.router.navigate([ruta]);
      },
      error: (err) => {
        console.error('Error al guardar preferencia:', err);
        alert('Hubo un error al guardar tu elección. Intenta nuevamente.');
      }
    });
  }
}
