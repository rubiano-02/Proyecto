import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CabeceraComponent } from './componentes/container/cabecera/cabecera.component';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { FormsModule } from '@angular/forms';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
// Importa PrincipalComponent, pero NO lo declares si es standalone
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { PerfilComponent } from './componentes/container/perfil/perfil.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component';
import { Matematicas1Component } from './componentes/container/matematicas-1/matematicas-1.component';
import { Registrarse1Component } from './componentes/container/registrarse1/registrarse1.component';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Lectura1Component } from './componentes/container/lectura-1/lectura-1.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { EjerciciosComponent } from './componentes/container/ejercicios/ejercicios.component';
import { PrinLecturaComponent } from './componentes/container/prin-lectura/prin-lectura.component';
import { EjerMatematicasComponent } from './componentes/container/ejer-matematicas/ejer-matematicas.component';
import { Matematicas2Component } from './componentes/container/matematicas-2/matematicas-2.component';
import { Matematicas3Component } from './componentes/container/matematicas-3/matematicas-3.component';
import { Matematicas4Component } from './componentes/container/matematicas-4/matematicas-4.component';
import { Matematicas5Component } from './componentes/container/matematicas-5/matematicas-5.component';
import { Matematicas6Component } from './componentes/container/matematicas-6/matematicas-6.component';
import { Matematicas7Component } from './componentes/container/matematicas-7/matematicas-7.component';
import { Matematicas8Component } from './componentes/container/matematicas-8/matematicas-8.component';
import { Matematicas9Component } from './componentes/container/matematicas-9/matematicas-9.component';
import { Matematicas10Component } from './componentes/container/matematicas-10/matematicas-10.component';
import { Matematicas11Component } from './componentes/container/matematicas-11/matematicas-11.component';
import { Matematicas12Component } from './componentes/container/matematicas-12/matematicas-12.component';
import { Matematicas13Component } from './componentes/container/matematicas-13/matematicas-13.component';
import { Matematicas14Component } from './componentes/container/matematicas-14/matematicas-14.component';
import { Matematicas15Component } from './componentes/container/matematicas-15/matematicas-15.component';
import { Lectura2Component } from './componentes/container/lectura-2/lectura-2.component';
import { Lectura3Component } from './componentes/container/lectura-3/lectura-3.component';
import { Lectura4Component } from './componentes/container/lectura-4/lectura-4.component';
import { Lectura5Component } from './componentes/container/lectura-5/lectura-5.component';
import { Lectura6Component } from './componentes/container/lectura-6/lectura-6.component';
import { Lectura7Component } from './componentes/container/lectura-7/lectura-7.component';
import { Lectura8Component } from './componentes/container/lectura-8/lectura-8.component';
import { Lectura9Component } from './componentes/container/lectura-9/lectura-9.component';
import { Lectura10Component } from './componentes/container/lectura-10/lectura-10.component';
import { Lectura11Component } from './componentes/container/lectura-11/lectura-11.component';
import { Lectura12Component } from './componentes/container/lectura-12/lectura-12.component';
import { Lectura13Component } from './componentes/container/lectura-13/lectura-13.component';
import { Lectura14Component } from './componentes/container/lectura-14/lectura-14.component';
import { Lectura15Component } from './componentes/container/lectura-15/lectura-15.component';
import { CommonModule } from '@angular/common'; // Necesario para ngIf, ngFor etc.

// Función necesaria para ngx-translate para cargar los archivos de traducción
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
    AppComponent,
    CabeceraComponent,
    InicioComponent,
    IniciarSesionComponent,
    EleccionComponent,
    // PrincipalComponent, // <-- ¡ELIMINA ESTA LÍNEA DE AQUÍ!
    ForoComponent,
    PerfilComponent,
    ConfiguracionComponent,
    Matematicas1Component,
    Registrarse1Component,
    Lectura1Component,
    EjerciciosComponent,
    EjerMatematicasComponent,
    Matematicas2Component,
    Matematicas3Component,
    Matematicas4Component,
    Matematicas5Component,
    Matematicas6Component,
    Matematicas7Component,
    Matematicas8Component,
    Matematicas9Component,
    Matematicas10Component,
    Matematicas11Component,
    Matematicas12Component,
    Matematicas13Component,
    Matematicas14Component,
    Matematicas15Component,
    Lectura2Component,
    Lectura3Component,
    Lectura4Component,
    Lectura5Component,
    Lectura6Component,
    Lectura7Component,
    Lectura8Component,
    Lectura9Component,
    Lectura10Component,
    Lectura11Component,
    Lectura12Component,
    Lectura13Component,
    Lectura14Component,
    Lectura15Component,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    DragDropModule,
    CommonModule, // Asegúrate de que CommonModule esté importado
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    PrincipalComponent, // <-- ¡DEBE ESTAR AQUÍ SI ES STANDALONE!
    PrinLecturaComponent,
  ],
  providers: [
    // provideClientHydration() // Descomenta si lo necesitas para SSR
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
