import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutModule } from './layout/layout.module';
import { LayoutComponent } from './layout/layout.component';

// Guards
import { ActiveContractGuard } from '@blockframes/contract/contract/guards/active-contract.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel/tunnel.guard';
import { ContractsRightListGuard } from '@blockframes/distribution-rights/guards/contracts-right-list.guard';
import { MovieListContractListGuard } from '@blockframes/movie/guards/movie-contract.guard';
import { MovieOrganizationListGuard } from '@blockframes/movie/guards/movie-organization-list.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',   // Home (dashboard if film, welcome if not)
        canActivate: [MovieOrganizationListGuard],
        canDeactivate: [MovieOrganizationListGuard],
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule),
        data: { animation: 'notifications' }
      },
      {
        path: 'invitations',
        loadChildren: () => import('./invitation/invitation.module').then(m => m.InvitationModule),
        data: { animation: 'invitations' }
      },
      {
        path: 'import', // Import bulk of movies
        loadChildren: () => import('@blockframes/import').then(m => m.ImportModule)
      },
      {
        path: 'search',  // Result of a search on the main searchbar
        loadChildren: () => import('./pages/search/search.module').then(m => m.SearchModule)
      },
      {
        path: 'titles',
        canActivate: [OrganizationContractListGuard],
        canDeactivate: [OrganizationContractListGuard],
        children: [{
          path: '',
          canActivate: [MovieOrganizationListGuard],
          canDeactivate: [MovieOrganizationListGuard],
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        }, {
          path: ':movieId',
          canActivate: [MovieActiveGuard],
          canDeactivate: [MovieActiveGuard],
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule),
          data: { redirect: '/c/o/dashboard/titles' }
        }]
      },
      {
        path: 'deals',
        children: [{
          path: '',
          canActivate: [OrganizationContractListGuard, ContractsRightListGuard, MovieListContractListGuard],
          canDeactivate: [OrganizationContractListGuard, ContractsRightListGuard, MovieListContractListGuard],
          loadChildren: () => import('./right/list/list.module').then(m => m.RightListModule)
        }, {
          path: ':contractId', // One right: different state of a right (offer, counter-offer, payment),
          canActivate: [ActiveContractGuard],
          canDeactivate: [ActiveContractGuard],
          loadChildren: () => import('./right/view/view.module').then(m => m.RightViewModule)
        }]
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
    path: 'tunnel',
    canActivate: [TunnelGuard],
    children: [{
      path: 'movie',
      children: [{
        path: '',
        loadChildren: () => import('./movie-tunnel/start/start-tunnel.module').then(m => m.StartTunnelModule)
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard, MovieTunnelGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('./movie-tunnel/movie-tunnel.module').then(m => m.MovieTunnelModule),
        data: {
          redirect: '/c/o/dashboard/tunnel/movie'
        },
      }]
    }, {
      path: 'contract',
      children: [{
        path: '',
        loadChildren: () => import('@blockframes/contract/contract/tunnel').then(m => m.ContractTunnelLobbyModule)
      },{
        path: ':contractId',
        canActivate: [ActiveContractGuard],
        canDeactivate: [ActiveContractGuard],
        loadChildren: () => import('@blockframes/contract/contract/tunnel').then(m => m.ContractTunnelModule),
        data: {
          redirect: '/c/o/dashboard/tunnel/contract'
        },
      }]
    }]
  }
];

@NgModule({
  imports: [LayoutModule, RouterModule.forChild(routes)],
  declarations: []
})
export class DashboardModule {}
