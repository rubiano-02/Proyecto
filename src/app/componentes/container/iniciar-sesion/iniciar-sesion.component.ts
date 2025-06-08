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
    this.http.get<any[]>('http://localhost:3000/usuarios').subscribe(usuarios => {
      const usuario = usuarios.find(u => 
        (u.email === this.email || u.nombre === this.email) && u.contraseña === this.contrasena
      );

      if (usuario) {
        alert('Inicio de sesión exitoso');
        this.router.navigate(['/principal']);  // redirige al dashboard
      } else {
        alert('Correo/usuario o contraseña incorrectos');
      }
    }, error => {
      console.error('Error al iniciar sesión:', error);
      alert('Error en el servidor');
    });
  }
}