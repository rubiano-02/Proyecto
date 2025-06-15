import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../servicios/usuario.service';
import { FileUploadService } from '../../../servicios/file-upload.service'; // ¡Añade esta línea!

@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'] // Corregido a 'styleUrls' con 's'
})
export class PerfilComponent implements OnInit {
  isSidebarActive = false;

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }

  userProfile: any = {
    nombre: 'Cargando...',
    fecha_registro: new Date(),
    foto_perfil_url: null, // Asegúrate de que estas propiedades existan
    fondo_perfil_url: null  // Asegúrate de que estas propiedades existan
  };
  userId: number | null = null;

  // Propiedades para la previsualización local, ya no para la persistencia
  imagenBanner: string | null = null;
  imagenAvatar: string | null = null;

  @ViewChild('inputBanner') inputBanner!: ElementRef;
  @ViewChild('inputAvatar') inputAvatar!: ElementRef;

  // ¡NUEVAS PROPIEDADES PARA EL MANEJO DE ARCHIVOS Y MENSAJES!
  selectedAvatarFile: File | null = null;
  selectedBannerFile: File | null = null;
  avatarUploadMessage: string | null = null;
  bannerUploadMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService,
    private fileUploadService: FileUploadService // ¡Añade esta inyección!
  ) {}

  ngOnInit() {
    // La lógica de carga de imágenes desde localStorage aquí ya no es necesaria
    // porque la fuente de verdad será la base de datos a través de loadUserProfile()

    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = +storedUserId;
      this.loadUserProfile(this.userId);
    } else {
      alert('No hay usuario logueado. Redirigiendo a la página de inicio de sesión.');
      this.router.navigate(['/iniciar-sesion']);
    }
  }

  seleccionarImagen(tipo: 'banner' | 'avatar') {
    if (tipo === 'banner') {
      this.inputBanner.nativeElement.click();
    } else if (tipo === 'avatar') {
      this.inputAvatar.nativeElement.click();
    }
  }

  // Método 'cambiarImagen' modificado: ahora solo almacena el archivo y previsualiza
  cambiarImagen(event: any, tipo: 'banner' | 'avatar') {
    const archivo = event.target.files[0];
    if (archivo) {
      if (tipo === 'banner') {
        this.selectedBannerFile = archivo;
        this.bannerUploadMessage = null; // Limpiar mensaje anterior
      } else if (tipo === 'avatar') {
        this.selectedAvatarFile = archivo;
        this.avatarUploadMessage = null; // Limpiar mensaje anterior
      }

      // Previsualización local del archivo seleccionado
      const lector = new FileReader();
      lector.onload = () => {
          if (tipo === 'banner') {
              this.imagenBanner = lector.result as string; // Actualiza la imagen mostrada temporalmente
          } else if (tipo === 'avatar') {
              this.imagenAvatar = lector.result as string; // Actualiza la imagen mostrada temporalmente
          }
      };
      lector.readAsDataURL(archivo);
    }
  }

  // Método para cargar el perfil del usuario desde el backend
  loadUserProfile(id: number): void {
    this.usuarioService.obtenerUsuarioPorId(id).subscribe(
      (data) => {
        this.userProfile = data;
        // Las propiedades foto_perfil_url y fondo_perfil_url vienen de la base de datos
        // Asegúrate de que tu backend las esté enviando con el prefijo /uploads/
        console.log('Perfil de usuario cargado:', this.userProfile);

        // Actualiza las imágenes mostradas usando las URLs del backend o las por defecto
        this.imagenBanner = this.getBannerUrl();
        this.imagenAvatar = this.getAvatarUrl();
      },
      (error) => {
        console.error('Error al cargar el perfil del usuario:', error);
        alert('No se pudo cargar el perfil del usuario. Inténtalo de nuevo.');
        // Si hay un error al cargar el perfil, muestra las imágenes por defecto
        this.imagenBanner = 'assets/Images/BannerDefault.png';
        this.imagenAvatar = 'assets/Images/Foto De Perfil.png';
      }
    );
  }

  // ¡NUEVOS MÉTODOS PARA SUBIR ARCHIVOS AL BACKEND!
  uploadAvatar(): void {
    if (!this.userId) {
      this.avatarUploadMessage = 'Error: ID de usuario no disponible.';
      return;
    }
    if (!this.selectedAvatarFile) {
      this.avatarUploadMessage = 'Por favor, selecciona una foto de perfil.';
      return;
    }

    this.avatarUploadMessage = 'Subiendo foto de perfil...';
    this.fileUploadService.uploadAvatar(this.userId, this.selectedAvatarFile).subscribe({
      next: (response) => {
        this.avatarUploadMessage = response.mensaje;
        this.userProfile.foto_perfil_url = response.imageUrl; // ¡ACTUALIZA LA URL DEL PERFIL CON LA QUE VIENE DEL BACKEND!
        this.imagenAvatar = this.getAvatarUrl(); // Refresca la imagen mostrada
        this.selectedAvatarFile = null; // Limpiar el archivo seleccionado
      },
      error: (error) => {
        console.error('Error al subir foto de perfil:', error);
        this.avatarUploadMessage = `Error al subir foto de perfil: ${error.error?.mensaje || error.message}`;
      }
    });
  }

  uploadBanner(): void {
    if (!this.userId) {
      this.bannerUploadMessage = 'Error: ID de usuario no disponible.';
      return;
    }
    if (!this.selectedBannerFile) {
      this.bannerUploadMessage = 'Por favor, selecciona una foto de fondo.';
      return;
    }

    this.bannerUploadMessage = 'Subiendo foto de fondo...';
    this.fileUploadService.uploadBanner(this.userId, this.selectedBannerFile).subscribe({
      next: (response) => {
        this.bannerUploadMessage = response.mensaje;
        this.userProfile.fondo_perfil_url = response.imageUrl; // ¡ACTUALIZA LA URL DEL PERFIL CON LA QUE VIENE DEL BACKEND!
        this.imagenBanner = this.getBannerUrl(); // Refresca la imagen mostrada
        this.selectedBannerFile = null; // Limpiar el archivo seleccionado
      },
      error: (error) => {
        console.error('Error al subir foto de fondo:', error);
        this.bannerUploadMessage = `Error al subir foto de fondo: ${error.error?.mensaje || error.message}`;
      }
    });
  }

  // Métodos para obtener la URL correcta de la imagen (desde backend o por defecto)
  getAvatarUrl(): string {
    if (this.userProfile.foto_perfil_url) {
      // Si la URL ya es completa (ej. http://localhost:3000/uploads/...), úsala directamente
      if (this.userProfile.foto_perfil_url.startsWith('http')) {
        return this.userProfile.foto_perfil_url;
      }
      // Si la URL es relativa (ej. /uploads/avatar-123.png), construye la URL completa
      return `http://localhost:3000${this.userProfile.foto_perfil_url}`;
    }
    // Retorna la imagen por defecto si no hay URL del backend
    return 'assets/Images/Foto De Perfil.png';
  }

  getBannerUrl(): string {
    if (this.userProfile.fondo_perfil_url) {
      // Si la URL ya es completa úsala directamente
      if (this.userProfile.fondo_perfil_url.startsWith('http')) {
        return this.userProfile.fondo_perfil_url;
      }
      return `http://localhost:3000${this.userProfile.fondo_perfil_url}`;
    }
    // Retorna la imagen por defecto si no hay URL del backend
    return 'assets/Images/BannerDefault.png';
  }
}