import { __decorate } from "tslib";
import { Component } from '@angular/core';
import AOS from 'aos';
let AppComponent = class AppComponent {
    title = 'DIJU';
    ngOnInit() {
        AOS.init();
    }
};
AppComponent = __decorate([
    Component({
        selector: 'app-root',
        templateUrl: './app.component.html',
        standalone: false,
        styleUrl: './app.component.css'
    })
], AppComponent);
export { AppComponent };
