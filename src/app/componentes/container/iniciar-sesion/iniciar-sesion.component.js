import { __decorate } from "tslib";
import { Component } from '@angular/core';
import AOS from 'aos';
let IniciarSesionComponent = class IniciarSesionComponent {
    ngOnInit() {
        AOS.init({
            once: true,
            duration: 800
        });
        // Disparar animaciones inmediatamente
        setTimeout(() => AOS.refresh(), 0);
    }
};
IniciarSesionComponent = __decorate([
    Component({
        selector: 'app-iniciar-sesion',
        standalone: false,
        templateUrl: './iniciar-sesion.component.html',
        styleUrl: './iniciar-sesion.component.css'
    })
], IniciarSesionComponent);
export { IniciarSesionComponent };
