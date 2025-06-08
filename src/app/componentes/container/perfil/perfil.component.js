import { __decorate } from "tslib";
import { Component, ViewChild } from '@angular/core';
let PerfilComponent = class PerfilComponent {
    isSidebarActive = false;
    toggleSidebar() {
        this.isSidebarActive = !this.isSidebarActive;
    }
    imagenBanner = null;
    imagenAvatar = null;
    inputBanner;
    inputAvatar;
    ngOnInit() {
        // Cargar imágenes desde localStorage al iniciar
        this.imagenBanner = localStorage.getItem('imagenBanner');
        this.imagenAvatar = localStorage.getItem('imagenAvatar');
    }
    seleccionarImagen(tipo) {
        if (tipo === 'banner') {
            this.inputBanner.nativeElement.click();
        }
        else if (tipo === 'avatar') {
            this.inputAvatar.nativeElement.click();
        }
    }
    cambiarImagen(event, tipo) {
        const archivo = event.target.files[0];
        if (archivo) {
            const lector = new FileReader();
            lector.onload = () => {
                const resultado = lector.result;
                if (tipo === 'banner') {
                    this.imagenBanner = resultado;
                    localStorage.setItem('imagenBanner', resultado);
                }
                else if (tipo === 'avatar') {
                    this.imagenAvatar = resultado;
                    localStorage.setItem('imagenAvatar', resultado);
                }
            };
            lector.readAsDataURL(archivo);
        }
    }
};
__decorate([
    ViewChild('inputBanner')
], PerfilComponent.prototype, "inputBanner", void 0);
__decorate([
    ViewChild('inputAvatar')
], PerfilComponent.prototype, "inputAvatar", void 0);
PerfilComponent = __decorate([
    Component({
        selector: 'app-perfil',
        standalone: false,
        templateUrl: './perfil.component.html',
        styleUrl: './perfil.component.css'
    })
], PerfilComponent);
export { PerfilComponent };
