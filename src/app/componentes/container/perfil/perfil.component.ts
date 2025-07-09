import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UsuarioService } from '../../../servicios/usuario.service';
import { FileUploadService } from '../../../servicios/file-upload.service';
import { LogroService, Logro } from '../../../servicios/logro.service'; // ¡Importa el nuevo servicio y la interfaz!

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

  userProfile: any = {
    nombre: 'Cargando...',
    fecha_registro: new Date(),
    foto_perfil_url: null,
    fondo_perfil_url: null
  };
  userId: number | null = null;

  imagenBanner: string | null = null;
  imagenAvatar: string | null = null;

  @ViewChild('inputBanner') inputBanner!: ElementRef;
  @ViewChild('inputAvatar') inputAvatar!: ElementRef;

  selectedAvatarFile: File | null = null;
  selectedBannerFile: File | null = null;
  avatarUploadMessage: string | null = null;
  bannerUploadMessage: string | null = null;

  // ¡NUEVA PROPIEDAD PARA ALMACENAR LOS LOGROS!
  logros: Logro[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private usuarioService: UsuarioService,
    private fileUploadService: FileUploadService,
    private logroService: LogroService // ¡Inyecta el nuevo servicio!
  ) {}

  ngOnInit() {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = +storedUserId;
      this.loadUserProfile(this.userId);
      this.loadUserLogros(this.userId); // ¡Carga los logros también!
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

  cambiarImagen(event: any, tipo: 'banner' | 'avatar') {
    const archivo = event.target.files[0];
    if (archivo) {
      if (tipo === 'banner') {
        this.selectedBannerFile = archivo;
        this.bannerUploadMessage = null;
      } else if (tipo === 'avatar') {
        this.selectedAvatarFile = archivo;
        this.avatarUploadMessage = null;
      }

      const lector = new FileReader();
      lector.onload = () => {
        if (tipo === 'banner') {
          this.imagenBanner = lector.result as string;
        } else if (tipo === 'avatar') {
          this.imagenAvatar = lector.result as string;
        }
      };
      lector.readAsDataURL(archivo);
    }
  }

  loadUserProfile(id: number): void {
    this.usuarioService.obtenerUsuarioPorId(id).subscribe(
      (data) => {
        this.userProfile = data;
        console.log('Perfil de usuario cargado:', this.userProfile);
        this.imagenBanner = this.getBannerUrl();
        this.imagenAvatar = this.getAvatarUrl();
      },
      (error) => {
        console.error('Error al cargar el perfil del usuario:', error);
        alert('No se pudo cargar el perfil del usuario. Inténtalo de nuevo.');
        this.imagenBanner = 'assets/Images/BannerDefault.png';
        this.imagenAvatar = 'assets/Images/Foto De Perfil.png';
      }
    );
  }

  // ¡NUEVO MÉTODO PARA CARGAR LOS LOGROS DEL USUARIO!
  loadUserLogros(id: number): void {
    this.logroService.obtenerLogrosUsuario(id).subscribe(
      (data: Logro[]) => {
        this.logros = data;
        console.log('Logros del usuario cargados:', this.logros);
        // Opcional: podrías ordenar los logros aquí, por ejemplo, los completados al final
        this.logros.sort((a, b) => {
            if (a.completado && !b.completado) return 1;
            if (!a.completado && b.completado) return -1;
            return 0; // Mantener el orden relativo si ambos están completados o no
        });
      },
      (error) => {
        console.error('Error al cargar los logros del usuario:', error);
        // Manejo de error, quizás mostrar un mensaje al usuario
        this.logros = []; // Asegurarse de que no haya logros antiguos si falla
      }
    );
  }

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
        this.userProfile.foto_perfil_url = response.imageUrl;
        this.imagenAvatar = this.getAvatarUrl();
        this.selectedAvatarFile = null;
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
        this.userProfile.fondo_perfil_url = response.imageUrl;
        this.imagenBanner = this.getBannerUrl();
        this.selectedBannerFile = null;
      },
      error: (error) => {
        console.error('Error al subir foto de fondo:', error);
        this.bannerUploadMessage = `Error al subir foto de fondo: ${error.error?.mensaje || error.message}`;
      }
    });
  }

  getAvatarUrl(): string {
    if (this.userProfile.foto_perfil_url) {
      if (this.userProfile.foto_perfil_url.startsWith('http')) {
        return this.userProfile.foto_perfil_url;
      }
      return `http://localhost:3000${this.userProfile.foto_perfil_url}`;
    }
    return 'assets/Images/Foto De Perfil.png';
  }

  getBannerUrl(): string {
    if (this.userProfile.fondo_perfil_url) {
      if (this.userProfile.fondo_perfil_url.startsWith('http')) {
        return this.userProfile.fondo_perfil_url;
      }
      return `http://localhost:3000${this.userProfile.fondo_perfil_url}`;
    }
    return 'assets/Images/BannerDefault.png';
  }

  // ¡NUEVOS MÉTODOS AUXILIARES PARA LOS LOGROS!
  getProgresoLogroPorcentaje(logro: Logro): number {
    if (logro.objetivo === 0) return 0; // Evita división por cero
    const porcentaje = (logro.progreso_actual / logro.objetivo) * 100;
    return Math.min(100, Math.max(0, porcentaje)); // Asegura que esté entre 0 y 100
  }

  getProgresoLogroTexto(logro: Logro): string {
    if (logro.completado) {
      return '100%'; // O "Completado" si prefieres texto
    }
    return `${Math.floor(this.getProgresoLogroPorcentaje(logro))}%`;
  }

  // Este método es crucial para el checkmark y los estilos
  isLogroCompletado(logro: Logro): boolean {
    return logro.completado; // Asumimos que el backend ya calcula esto
  }

  // Método para obtener la clase de color para la barra de progreso
  getLogroBarraColorClass(logro: Logro): string {
    if (logro.completado) {
        return 'verde'; // Un color especial para los logros completados
    }
    // Si no está completado, usa el color que venga del backend o uno por defecto
    switch (logro.color_barra) {
        case 'rojo': return 'rojo';
        case 'azul': return 'azul';
        case 'naranja': return 'naranja';
        default: return 'verde-claro'; // Un color por defecto si no se especifica o no está en la lista
    }
  }
}
