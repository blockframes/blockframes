import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieCreateComponent } from '@blockframes/movie/movie/pages/movie-create/movie-create.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'no-movies',
    component: MovieCreateComponent
  },
  {
    path: 'home',
    loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
  },
  {
    path: 'templates',
    loadChildren: () => import('@blockframes/material').then(m => m.TemplateModule)
  },
  {
    path: 'delivery',
    loadChildren: () => import('@blockframes/material').then(m => m.DeliveryModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class DeliveryAppModule {}
