import { __decorate } from "tslib";
import { Component } from '@angular/core';
let ForoComponent = class ForoComponent {
    isSidebarActive = false;
    toggleSidebar() {
        this.isSidebarActive = !this.isSidebarActive;
    }
};
ForoComponent = __decorate([
    Component({
        selector: 'app-foro',
        standalone: false,
        templateUrl: './foro.component.html',
        styleUrl: './foro.component.css'
    })
], ForoComponent);
export { ForoComponent };
