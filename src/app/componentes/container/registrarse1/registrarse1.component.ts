import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import AOS from 'aos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrarse1',
  standalone: false,
  templateUrl: './registrarse1.component.html',
  styleUrl: './registrarse1.component.css'
})
export class Registrarse1Component implements OnInit {
  mostrarContrasena: boolean = false;

  nombre: string = '';
  edad: number | null = null;
  contrasena: string = '';
  email: string = '';
  
  constructor(
  private http: HttpClient,
  private router: Router,
  @Inject(PLATFORM_ID) private platformId: Object
) {}


  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init({
        once: true,
        duration: 800
      });
      setTimeout(() => AOS.refresh(), 0);
    }
  }

  toggleContrasena() {
    this.mostrarContrasena = !this.mostrarContrasena;
  }

  get tipoContrasena(): string {
    return this.mostrarContrasena ? 'text' : 'password';
  }

  get iconoOjo(): string {
    return this.mostrarContrasena ? '🙈' : '👁️';
  }

  registrar() {
    if (!this.nombre || !this.edad || !this.contrasena) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const nuevoUsuario = {
      nombre: this.nombre,
      edad: this.edad,
      contraseña: this.contrasena,
      email: this.email
    };

    this.http.post('http://localhost:3000/usuarios', nuevoUsuario).subscribe({
      next: (res) => {
        alert('Usuario registrado con éxito');
        this.nombre = '';
        this.edad = null;
        this.contrasena = '';
        this.email = '';
        this.router.navigate(['/iniciar-sesion']);
      },
      error: (err) => {
        console.error('Error al registrar:', err);
        alert('Error al registrar usuario');
      }
    });

  }
}
