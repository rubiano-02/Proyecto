import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CabeceraComponent } from './componentes/container/cabecera/cabecera.component';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { OperacionesComponent } from './componentes/container/operaciones/operaciones.component';
import {FormsModule} from '@angular/forms';
import { RegistrarseComponent } from './componentes/container/registrarse/registrarse.component';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { PerfilComponent } from './componentes/container/perfil/perfil.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component'

@NgModule({
  declarations: [
    AppComponent,
    CabeceraComponent,
    InicioComponent,
    OperacionesComponent,
    RegistrarseComponent,
    IniciarSesionComponent,
    EleccionComponent,
    PrincipalComponent,
    ForoComponent,
    PerfilComponent,
    ConfiguracionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
