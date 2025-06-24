import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CabeceraComponent } from './componentes/container/cabecera/cabecera.component';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { FormsModule } from '@angular/forms';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { PerfilComponent } from './componentes/container/perfil/perfil.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component';
import { Matematicas1Component } from './componentes/container/matematicas-1/matematicas-1.component';
import { Registrarse1Component } from './componentes/container/registrarse1/registrarse1.component';
import { HttpClientModule } from '@angular/common/http';
import { Lectura1Component } from './componentes/container/lectura-1/lectura-1.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EjerciciosComponent } from './componentes/container/ejercicios/ejercicios.component';
import { PrinLecturaComponent } from './componentes/container/prin-lectura/prin-lectura.component';
import { EjerMatematicasComponent } from './componentes/container/ejer-matematicas/ejer-matematicas.component';
import { Matematicas2Component } from './componentes/container/matematicas-2/matematicas-2.component';
import { Matematicas3Component } from './componentes/container/matematicas-3/matematicas-3.component';
import { Matematicas4Component } from './componentes/container/matematicas-4/matematicas-4.component';
import { Matematicas5Component } from './componentes/container/matematicas-5/matematicas-5.component';

@NgModule({
  declarations: [
    AppComponent,
    CabeceraComponent,
    InicioComponent,
    IniciarSesionComponent,
    EleccionComponent,
    PrincipalComponent,
    ForoComponent,
    PerfilComponent,
    ConfiguracionComponent,
    Matematicas1Component,
    Registrarse1Component,
    Lectura1Component,
    EjerciciosComponent,
    PrinLecturaComponent,
    EjerMatematicasComponent,
    Matematicas2Component,
    Matematicas3Component,
    Matematicas4Component,
    Matematicas5Component,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DragDropModule

  ],
  providers: [
   //provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }