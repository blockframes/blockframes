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
        path: 'overview'
      },
      {
        path: 'titles'
      },
      {
        path: 'deals'
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
      {
        path: 'movie-tunnel',
        loadChildren: () => import('./movie-tunnel/movie-tunnel.module').then(m => m.MovieTunnelModule)
      }
    ]
  },
];

@NgModule({
  imports: [LayoutModule, RouterModule.forChild(routes)],
  declarations: []
})
export class DashboardModule {}
