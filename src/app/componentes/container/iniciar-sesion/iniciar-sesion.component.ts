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

  iniciarSesion() {
    const credenciales = {
      usuario: this.email,
      contrasena: this.contrasena
    };

    this.http.post<any>('http://localhost:3000/login', credenciales).subscribe(
      response => {
        if (response.success) {
          if (response.userId) {
            localStorage.setItem('user_id', response.userId);
            console.log('ID de usuario logueado guardado en localStorage:', response.userId);
          } else {
            console.warn('Backend no devolvió userId en la respuesta de login.');
          }

          this.http.get<any>(`http://localhost:3000/usuarios/${response.userId}`).subscribe(
            usuario => {
              const preferencia = response.tipo_ejercicio_preferido;
              localStorage.setItem('preferencia', preferencia || '');
              if (!preferencia) {
                this.router.navigate(['/eleccion']);
              } else if (preferencia === 'matematicas') {
                this.router.navigate(['/principal']);
              } else if (preferencia === 'lectura') {
                this.router.navigate(['/prin-lectura']);
              } else {
                this.router.navigate(['/eleccion']);
              }
            },
            error => {
              console.error('Error al obtener datos del usuario:', error);
              this.router.navigate(['/eleccion']);
            }
          );

        } else {
          // No alert, solo log opcional
          console.warn(response.error || 'Correo/usuario o contraseña incorrectos');
        }
      },
      error => {
        console.error('Error al iniciar sesión:', error);
      }
    );
  }
}