import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CabeceraComponent } from './componentes/container/cabecera/cabecera.component';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RegistrarseComponent } from './componentes/container/registrarse/registrarse.component';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { PerfilComponent } from './componentes/container/perfil/perfil.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component';
import { Matematicas1Component } from './componentes/container/matematicas-1/matematicas-1.component';
import { UsuariosComponent } from './componentes/container/usuarios/usuarios.component';
let AppModule = class AppModule {
};
AppModule = __decorate([
    NgModule({
        declarations: [
            AppComponent,
            CabeceraComponent,
            InicioComponent,
            RegistrarseComponent,
            IniciarSesionComponent,
            EleccionComponent,
            PrincipalComponent,
            ForoComponent,
            PerfilComponent,
            ConfiguracionComponent,
            Matematicas1Component,
            UsuariosComponent
        ],
        imports: [
            BrowserModule,
            AppRoutingModule,
            FormsModule,
            HttpClientModule,
        ],
        providers: [
            provideClientHydration()
        ],
        bootstrap: [AppComponent]
    })
], AppModule);
export { AppModule };
