import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieCreateComponent } from '@blockframes/movie/movie/pages/movie-create/movie-create.component';
import { MovieOrganizationListGuard } from '@blockframes/movie/movie/guards/movie-organization-list.guard';
import { MovieActiveGuard } from '@blockframes/movie';

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
    canActivate: [MovieOrganizationListGuard],
    canDeactivate: [MovieOrganizationListGuard],
    loadChildren: () => import('./home/home.module').then(m => m.DeliveryHomeModule),
  },
  {
    path: 'templates',
    loadChildren: () => import('@blockframes/material').then(m => m.TemplateModule)
  },
  {
    path: 'movie',
    loadChildren: () => import('@blockframes/material').then(m => m.DeliveryModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class DeliveryAppModule {}
