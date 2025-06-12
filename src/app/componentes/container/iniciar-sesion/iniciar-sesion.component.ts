import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import AOS from 'aos';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: false,
  templateUrl: './iniciar-sesion.component.html',
  styleUrl: './iniciar-sesion.component.css'
})
export class IniciarSesionComponent implements OnInit {
  email: string = '';
  contrasena: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    AOS.init({
      once: true,
      duration: 800
    });
    setTimeout(() => AOS.refresh(), 0);
  }

  // **** CAMBIO AQUÍ: Envía una solicitud POST al endpoint /login del backend ****
  iniciarSesion() {
    const credenciales = {
      usuario: this.email, // El backend espera 'usuario' que puede ser email o nombre
      contrasena: this.contrasena
    };

    // Realiza la petición POST a tu endpoint de login en el backend
    this.http.post<any>('http://localhost:3000/login', credenciales).subscribe(
      response => {
        if (response.success) {
          alert('Inicio de sesión exitoso');
          // Aquí podrías guardar el userId o un token de sesión si tu backend lo devuelve
          console.log('ID de usuario logueado:', response.userId);
          this.router.navigate(['/principal']);  // redirige al dashboard
        } else {
          // Si el backend devuelve success: false con un error
          alert(response.error || 'Correo/usuario o contraseña incorrectos');
        }
      },
      error => {
        // Manejo de errores de la petición HTTP (ej. servidor no responde, error de red)
        console.error('Error al iniciar sesión:', error);
        alert('Error en el servidor al intentar iniciar sesión. Inténtalo de nuevo más tarde.');
      }
    );
  }
}