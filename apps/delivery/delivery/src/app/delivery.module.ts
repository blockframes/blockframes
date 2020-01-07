import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MovieOrganizationListGuard } from '@blockframes/movie/guards/movie-organization-list.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
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
