import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component';
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { PerfilComponent } from './componentes/container/perfil/perfil.component';
import { Matematicas1Component } from './componentes/container/matematicas-1/matematicas-1.component';
import { Registrarse1Component } from './componentes/container/registrarse1/registrarse1.component';
import { Lectura1Component } from './componentes/container/lectura-1/lectura-1.component';
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

const routes: Routes = [
  {path: 'inicio', component:InicioComponent},
  {path: 'configuracion', component: ConfiguracionComponent},
  {path: 'eleccion', component: EleccionComponent},
  {path: 'foro', component: ForoComponent},
  {path: 'iniciar-sesion', component: IniciarSesionComponent},
  {path: 'perfil', component: PerfilComponent},
  {path: 'matematicas-1', component: Matematicas1Component},
  {path: 'registrarse1', component: Registrarse1Component},
  {path: 'principal', component: PrincipalComponent},
  {path: 'lectura-1', component: Lectura1Component},
  {path: 'ejercicios', component: EjerciciosComponent},
  {path: 'prin-lectura', component: PrinLecturaComponent},
  {path: 'ejer-matematicas', component: EjerMatematicasComponent},
  {path: 'matematicas-2' , component: Matematicas2Component},
  {path: 'matematicas-3' , component: Matematicas3Component},
  {path: 'matematicas-4' , component: Matematicas4Component},
  {path: 'matematicas-5' , component: Matematicas5Component},
  {path: 'matematicas-6' , component: Matematicas6Component},
  {path: 'matematicas-7' , component: Matematicas7Component},
  {path: 'matematicas-8' , component: Matematicas8Component},
  {path: 'matematicas-9' , component: Matematicas9Component},
  {path: 'matematicas-10' , component: Matematicas10Component},
  {path: 'matematicas-11' , component: Matematicas11Component},
  {path: 'matematicas-12' , component: Matematicas12Component},
  {path: 'matematicas-13' , component: Matematicas13Component},
  {path: 'matematicas-14' , component: Matematicas14Component},
  {path: 'matematicas-15' , component: Matematicas15Component},
  { path: '', redirectTo: '/iniciar-sesion', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
