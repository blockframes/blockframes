import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const catalogDashboardAppRoutes: Routes = [{
  path: '',
  redirectTo: 'catalog',
  pathMatch: 'full'
}, {
  path: 'import',
  loadChildren: () => import('@blockframes/movie/import').then(m => m.ImportMovieModule)
},
{
  path: 'catalog',
  loadChildren: () => import('./pages/dashboard-home/dashboard-home.module').then(m => m.DashboardHomeModule)
}];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(catalogDashboardAppRoutes)]
})
export class CatalogDashboardAppModule {}
