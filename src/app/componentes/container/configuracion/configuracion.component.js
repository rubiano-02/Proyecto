import { __decorate } from "tslib";
import { Component } from '@angular/core';
let ConfiguracionComponent = class ConfiguracionComponent {
    isSidebarActive = false;
    toggleSidebar() {
        this.isSidebarActive = !this.isSidebarActive;
    }
};
ConfiguracionComponent = __decorate([
    Component({
        selector: 'app-configuracion',
        standalone: false,
        templateUrl: './configuracion.component.html',
        styleUrls: ['./configuracion.component.css'],
    })
], ConfiguracionComponent);
export { ConfiguracionComponent };
