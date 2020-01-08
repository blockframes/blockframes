import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MovieCreateComponent } from '@blockframes/movie/movie/components/movie-create/movie-create.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'catalog',
    pathMatch: 'full'
  },
  {
    path: 'about',
    loadChildren: () => import('./pages/about-page/about.module').then(m => m.AboutModule)
  },
  {
    path: 'who-are-we',
    loadChildren: () => import('./pages/team-page/team.module').then(m => m.TeamModule)
  },
  {
    path: 'contact',
    loadChildren: () => import('./pages/contact-page/contact.module').then(m => m.ContactModule)
  },
  {
    path: 'terms',
    loadChildren: () => import('./pages/privacy-page/privacy.module').then(m => m.PrivacyModule)
  },
  {
    path: 'no-movies',
    component: MovieCreateComponent
  },
  {
    path: 'import',
    loadChildren: () => import('@blockframes/movie/import').then(m => m.ImportMovieModule)
  },
  {
    path: 'catalog',
    loadChildren: () =>
      import('./pages/dashboard-home/dashboard-home.module').then(m => m.DashboardHomeModule)
  }
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class CatalogDashboardAppModule {}
