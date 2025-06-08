import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component';
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './componentes/container/registrarse/registrarse.component';
import { PerfilComponent } from './componentes/container/perfil/perfil.component';
import { Matematicas1Component } from './componentes/container/matematicas-1/matematicas-1.component';
const routes = [
    { path: 'inicio', component: InicioComponent },
    { path: 'configuracion', component: ConfiguracionComponent },
    { path: 'principal', component: PrincipalComponent },
    { path: 'eleccion', component: EleccionComponent },
    { path: 'foro', component: ForoComponent },
    { path: 'iniciar-sesion', component: IniciarSesionComponent },
    { path: 'registrarse', component: RegistrarseComponent },
    { path: 'perfil', component: PerfilComponent },
    { path: 'matematicas-1', component: Matematicas1Component }
];
let AppRoutingModule = class AppRoutingModule {
};
AppRoutingModule = __decorate([
    NgModule({
        imports: [RouterModule.forRoot(routes)],
        exports: [RouterModule]
    })
], AppRoutingModule);
export { AppRoutingModule };
