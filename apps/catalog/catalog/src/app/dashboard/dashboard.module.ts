import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from './layout/layout.module';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',   // Home (dashboard if film, welcome if not)
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
      },
      {
        // TODO(#1522)
        path: 'activity',   // List of notifications
        // loadChildren: () => import('@blockframes/notifications/pages/list/list.module').then(m => m.NotificationsListModule)
      },
      {
        path: 'import', // Import bulk of movies
        loadChildren: () => import('@blockframes/movie/movie/components/import/import-movie.module')
          .then(m => m.ImportMovieModule)
      },
      {
        path: 'search',  // Result of a search on the main searchbar
        loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule)
      },
      {
        path: 'titles',
        children: [{
          path: '',
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        }, {
          path: ':movieId',
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule)
        }]
      },
      {
        path: 'deals',
        children: [{
          path: '',
          loadChildren: () => import('./deal/list/list.module').then(m => m.DealListModule)
        }, {
          path: ':dealId', // One deal: different state of a deal (offer, counter-offer, payment),
          loadChildren: () => import('./deal/view/view.module').then(m => m.DealViewModule)
        }]
      },
      {
        path: 'faq'
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
    ]
  },
  {
    path: 'movie-tunnel/:movieId',
    loadChildren: () => import('./movie-tunnel/movie-tunnel.module').then(m => m.MovieTunnelModule)
  }
];

@NgModule({
  imports: [LayoutModule, RouterModule.forChild(routes)],
  declarations: []
})
export class DashboardModule {}
