import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import AOS from 'aos';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrarse1',
  standalone: false,
  templateUrl: './registrarse1.component.html',
  styleUrl: './registrarse1.component.css' // ✅ En plural
})
export class Registrarse1Component implements OnInit {
  mostrarContrasena: boolean = false;

  nombre: string = '';
  edad: number | null = null;
  contrasena: string = '';
  email: string = '';
  modalNombre = '';
  modalEdad: number | null = null;
  modalEmail = '';
  modalContrasena = '';
  // Para manejar modal y búsqueda
  mostrarModal: boolean = false;
  idBuscar: number | null = null;
  usuario: any = null; // objeto usuario encontrado
  usuarioEncontrado: any = null;
  usuarioIdBuscar: number | null = null;
  usuarioNoEncontrado: boolean = false;
  nombrePadre: string = '';
  telefonoPadre: string = '';
  emailPadre: string = '';
  direccionPadre: string = '';

  // Control para mostrar el modal automáticamente si es menor
  mostrarModalPadre: boolean = false;
  usuarioTemporal: any = null;
  padre = {
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  };
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

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
    if (this.edad !== null && this.edad < 18) {
      this.usuarioTemporal = {
        nombre: this.nombre,
        edad: this.edad,
        email: this.email,
        contraseña: this.contrasena
      };
      this.mostrarModalPadre = true;
      return;
    }

    const nuevoUsuario = {
      nombre: this.nombre,
      edad: this.edad,
      email: this.email,
      contraseña: this.contrasena
    };

    this.http.post<any>('http://localhost:3000/usuarios', nuevoUsuario).subscribe({
      next: () => {
        this.router.navigate(['/iniciar-sesion']);
      },
      error: (error) => {
        console.error('Error al registrar usuario:', error);
      }
    });
  }

  guardarPadreYTutor() {
    if (!this.padre.nombre || this.padre.nombre.trim() === '') {
      return;
    }

    this.http.post<any>('http://localhost:3000/padres', this.padre).subscribe({
      next: (respuestaPadre) => {
        const idPadre = respuestaPadre.id_padre;

        const nuevoUsuario = {
          nombre: this.usuarioTemporal.nombre,
          edad: this.usuarioTemporal.edad,
          email: this.usuarioTemporal.email,
          contraseña: this.usuarioTemporal.contraseña,
          id_padre: idPadre
        };

        this.http.post<any>('http://localhost:3000/usuarios', nuevoUsuario).subscribe({
          next: () => {
            this.mostrarModalPadre = false;
            this.usuarioTemporal = null;
            this.router.navigate(['/iniciar-sesion']);
          },
          error: (error) => {
            console.error('Error al registrar usuario:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al registrar padre/tutor:', error);
      }
    });
  }

  cancelarRegistroPadre() {
    this.mostrarModalPadre = false;
    this.padre = {
      nombre: '',
      telefono: '',
      email: '',
      direccion: ''
    };
    this.usuarioTemporal = null;
  }

  cerrarModalPadre() {
    this.mostrarModalPadre = false;
    this.padre = {
      nombre: '',
      telefono: '',
      email: '',
      direccion: ''
    };
    this.usuarioTemporal = null;
  }

  limpiarCampos() {
    this.nombre = '';
    this.edad = null;
    this.contrasena = '';
    this.email = '';
    this.usuarioIdBuscar = null;
  }

  abrirModal() {
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.usuarioIdBuscar = null;
    this.usuarioEncontrado = null;
    this.usuarioNoEncontrado = false;
  }

  buscarUsuarioPorId() {
    if (this.usuarioIdBuscar === null) return;

    this.http.get<any>(`http://localhost:3000/usuarios/${this.usuarioIdBuscar}`).subscribe({
      next: (data) => {
        this.usuarioEncontrado = data;
        this.usuarioNoEncontrado = false;
      },
      error: () => {
        this.usuarioEncontrado = null;
        this.usuarioNoEncontrado = true;
      }
    });
  }

  actualizarUsuario() {
    if (!this.usuarioEncontrado) return;

    this.http.put(`http://localhost:3000/usuarios/${this.usuarioIdBuscar}`, this.usuarioEncontrado)
      .subscribe(() => {
        // alert eliminado
      });
  }

  eliminarUsuario() {
    if (!this.usuarioIdBuscar) return;

    this.http.delete(`http://localhost:3000/usuarios/${this.usuarioIdBuscar}`)
      .subscribe(() => {
        this.usuarioEncontrado = null;
      });
  }

}


