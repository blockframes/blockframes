import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieCreateComponent } from '@blockframes/movie/movie/components/movie-create/movie-create.component';
import { MovieCreateModule } from '@blockframes/movie/movie/components/movie-create/movie-create.module';
import { LayoutModule } from './layout/layout.module';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent
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
    path: 'home',
    loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
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
  imports: [LayoutModule, MovieCreateModule, RouterModule.forChild(routes)]
})
export class DashboardModule {}
