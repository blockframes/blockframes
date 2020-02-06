import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from './layout/layout.module';
import { LayoutComponent } from './layout/layout.component';

// Guards
import { ActiveContractGuard } from '@blockframes/contract/contract/guards/active-contract.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';
import { ContractsDealListGuard } from '@blockframes/movie/distribution-deals/guards/contracts-deal-list.guard';
import { MovieActiveGuard, MovieOrganizationListGuard } from '@blockframes/movie';
import { TunnelGuard } from '@blockframes/ui/tunnel';


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
          canActivate: [MovieOrganizationListGuard, OrganizationContractListGuard],
          canDeactivate: [MovieOrganizationListGuard, OrganizationContractListGuard],
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        }, {
          path: ':movieId',
          canActivate: [MovieActiveGuard],
          canDeactivate: [MovieActiveGuard],
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule)
        }]
      },
      {
        path: 'deals',
        children: [{
          path: '',
          canActivate: [OrganizationContractListGuard, ContractsDealListGuard, MovieOrganizationListGuard],
          canDeactivate: [OrganizationContractListGuard, ContractsDealListGuard, MovieOrganizationListGuard],
          loadChildren: () => import('./deal/list/list.module').then(m => m.DealListModule)
        }, {
          path: ':contractId', // One deal: different state of a deal (offer, counter-offer, payment),
          canActivate: [ActiveContractGuard],
          canDeactivate: [ActiveContractGuard],
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
    path: 'movie-tunnel',
    canActivate: [TunnelGuard],
    canDeactivate: [TunnelGuard],
    children: [{
      path: '',
      loadChildren: () => import('./movie-tunnel/start/start-tunnel.module').then(m => m.StartTunnelModule)
    }, {
      path: ':movieId',
      canActivate: [MovieActiveGuard],
      canDeactivate: [MovieActiveGuard],
      loadChildren: () => import('./movie-tunnel/movie-tunnel.module').then(m => m.MovieTunnelModule),
      data: {
        redirect: '/c/o/dashboard/movie-tunnel'
      },
    }]
  }

];

@NgModule({
  imports: [LayoutModule, RouterModule.forChild(routes)],
  declarations: []
})
export class DashboardModule {}
