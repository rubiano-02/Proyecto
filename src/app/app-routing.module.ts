import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { OperacionesComponent } from './componentes/container/operaciones/operaciones.component';
import { ConfiguracionComponent } from './componentes/container/configuracion/configuracion.component';
import { PrincipalComponent } from './componentes/container/principal/principal.component';
import { EleccionComponent } from './componentes/container/eleccion/eleccion.component';
import { ForoComponent } from './componentes/container/foro/foro.component';
import { IniciarSesionComponent } from './componentes/container/iniciar-sesion/iniciar-sesion.component';
import { RegistrarseComponent } from './componentes/container/registrarse/registrarse.component';

const routes: Routes = [
  {path: 'inicio', component:InicioComponent},
  {path: 'operaciones', component: OperacionesComponent},
  {path: 'configuracion', component: ConfiguracionComponent},
  {path: 'principal', component: PrincipalComponent},
  {path: 'eleccion', component: EleccionComponent},
  {path: 'foro', component: ForoComponent},
  {path: 'iniciar-sesion', component: IniciarSesionComponent},
  {path: 'registrarse', component: RegistrarseComponent},
  {path: '', redirectTo: 'inicio', pathMatch:'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
