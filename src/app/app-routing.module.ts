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
  { path: '', redirectTo: '/iniciar-sesion', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
