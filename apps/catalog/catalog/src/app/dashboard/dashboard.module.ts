﻿import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Guards
import { ActiveContractGuard } from '@blockframes/contract/contract/guards/active-contract.guard';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel/tunnel.guard';
import { ContractsRightListGuard } from '@blockframes/distribution-rights/guards/contracts-right-list.guard';
import { MovieListContractListGuard } from '@blockframes/movie/guards/movie-contract.guard';
import { MovieOrganizationListGuard } from '@blockframes/movie/guards/movie-organization-list.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
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
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('@blockframes/notification/notification.module').then(m => m.NotificationModule),
        data: { animation: 'notifications' }
      },
      {
        path: 'invitations',
        loadChildren: () => import('@blockframes/invitation/invitation.module').then(m => m.InvitationModule),
        data: { animation: 'invitations' }
      },
      {
        path: 'import', // Import bulk of movies
        loadChildren: () => import('@blockframes/import').then(m => m.ImportModule)
      },
      {
        path: 'title',
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
        loadChildren: () => import('@blockframes/ui/static-informations/about/about.module').then(m => m.AboutModule)
      },
      {
        path: 'contact',
        loadChildren: () => import('@blockframes/ui/static-informations/contact/contact.module').then(m => m.ContactModule)
      },
      {
        path: 'terms',
        loadChildren: () => import('@blockframes/ui/static-informations/terms/terms.module').then(m => m.TermsModule)
      },
      {
        path: 'privacy',
        loadChildren: () => import('@blockframes/ui/static-informations/privacy/privacy.module').then(m => m.PrivacyModule)
      }
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
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DashboardLayoutModule,
    ImageReferenceModule,
    OrgNameModule,
    ToLabelModule,

    // Material
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule {}
