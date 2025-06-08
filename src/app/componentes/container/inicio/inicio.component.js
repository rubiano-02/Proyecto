import { __decorate } from "tslib";
import { Component } from '@angular/core';
import AOS from 'aos';
let InicioComponent = class InicioComponent {
    ngOnInit() {
        AOS.init({
            duration: 1000,
            once: true
        });
    }
};
InicioComponent = __decorate([
    Component({
        selector: 'app-inicio',
        standalone: false,
        templateUrl: './inicio.component.html',
        styleUrl: './inicio.component.css'
    })
], InicioComponent);
export { InicioComponent };
