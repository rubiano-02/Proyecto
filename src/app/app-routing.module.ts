import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioComponent } from './componentes/container/inicio/inicio.component';
import { OperacionesComponent } from './componentes/container/operaciones/operaciones.component';

const routes: Routes = [
  {path: 'inicio', component:InicioComponent},
  {path: 'operaciones', component: OperacionesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
