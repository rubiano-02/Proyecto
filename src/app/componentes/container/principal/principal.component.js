import { __decorate } from "tslib";
import { Component } from '@angular/core';
let PrincipalComponent = class PrincipalComponent {
    isSidebarActive = false;
    toggleSidebar() {
        this.isSidebarActive = !this.isSidebarActive;
    }
};
PrincipalComponent = __decorate([
    Component({
        selector: 'app-principal',
        standalone: false,
        templateUrl: './principal.component.html',
        styleUrl: './principal.component.css'
    })
], PrincipalComponent);
export { PrincipalComponent };
