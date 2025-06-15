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

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    AOS.init({
      once: true,
      duration: 800
    });
    setTimeout(() => AOS.refresh(), 0);
  }

  iniciarSesion() {
    const credenciales = {
      usuario: this.email,
      contrasena: this.contrasena
    };

    this.http.post<any>('http://localhost:3000/login', credenciales).subscribe(
      response => {
        if (response.success) {
          alert('Inicio de sesión exitoso');
          // ¡¡¡CAMBIO CRUCIAL AQUÍ!!!
          if (response.userId) { // Asegúrate de que response.userId existe antes de guardarlo
            localStorage.setItem('user_id', response.userId); // <--- ¡AÑADIR ESTA LÍNEA!
            console.log('ID de usuario logueado guardado en localStorage:', response.userId);
          } else {
            console.warn('Backend no devolvió userId en la respuesta de login.');
            alert('Inicio de sesión exitoso, pero no se pudo obtener el ID de usuario. Algunas funciones podrían no estar disponibles.');
          }
          // Puedes guardar también un token si tu backend lo devuelve
          // localStorage.setItem('token', response.token);

          // Obtener preferencia del usuario y redirigir
          this.http.get<any>(`http://localhost:3000/usuarios/${response.userId}`).subscribe(
            usuario => {
              const preferencia = usuario.tipo_ejercicio_preferido;

              if (!preferencia) {
                this.router.navigate(['/eleccion']);
              } else if (preferencia === 'matematicas') {
                this.router.navigate(['/principal']);
              } else if (preferencia === 'lectura') {
                this.router.navigate(['/prin-lectura']);
              } else {
                alert('Preferencia no válida. Por favor elígela nuevamente.');
                this.router.navigate(['/eleccion']);
              }
            },
            error => {
              console.error('Error al obtener datos del usuario:', error);
              alert('No se pudo obtener la preferencia. Redirigiendo...');
              this.router.navigate(['/eleccion']);
            }
          );

        } else {
          alert(response.error || 'Correo/usuario o contraseña incorrectos');
        }
      },
      error => {
        console.error('Error al iniciar sesión:', error);
        alert('Error en el servidor al intentar iniciar sesión. Inténtalo de nuevo más tarde.');
      }
    );
  }
}