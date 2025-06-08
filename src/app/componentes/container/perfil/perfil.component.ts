import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
@Component({
  selector: 'app-perfil',
  standalone: false,
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
isSidebarActive = false;

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
  imagenBanner: string | null = null;
  imagenAvatar: string | null = null;

  @ViewChild('inputBanner') inputBanner!: ElementRef;
  @ViewChild('inputAvatar') inputAvatar!: ElementRef;

  ngOnInit() {
    // Cargar imágenes desde localStorage al iniciar
    this.imagenBanner = localStorage.getItem('imagenBanner');
    this.imagenAvatar = localStorage.getItem('imagenAvatar');
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
      const lector = new FileReader();
      lector.onload = () => {
        const resultado = lector.result as string;
        if (tipo === 'banner') {
          this.imagenBanner = resultado;
          localStorage.setItem('imagenBanner', resultado);
        } else if (tipo === 'avatar') {
          this.imagenAvatar = resultado;
          localStorage.setItem('imagenAvatar', resultado);
        }
      };
      lector.readAsDataURL(archivo);
    }
  }
}
