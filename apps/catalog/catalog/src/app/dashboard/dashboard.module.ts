// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

// Component
import { DashboardComponent } from './dashboard.component';

// Blockframes
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { MovieFormShellModule } from '@blockframes/movie/form/shell/shell.module';
import { MovieShellConfig } from '@blockframes/movie/form/movie.shell.config';
import { FORMS_CONFIG } from '@blockframes/movie/form/shell/shell.component';

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

// Tunnel routes
import { tunnelRoutes } from './tunnel/movie-tunnel.routes';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home', // Home (dashboard if film, welcome if not)
        canActivate: [MovieOrganizationListGuard],
        canDeactivate: [MovieOrganizationListGuard],
        loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'notifications',
        loadChildren: () =>
          import('@blockframes/notification/notification.module').then((m) => m.NotificationModule),
        data: { animation: 'notifications' },
      },
      {
        path: 'invitations',
        loadChildren: () =>
          import('@blockframes/invitation/invitation.module').then((m) => m.InvitationModule),
        data: { animation: 'invitations' },
      },
      {
        path: 'import', // Import bulk of movies
        loadChildren: () => import('@blockframes/import').then((m) => m.ImportModule),
      },
      {
        path: 'title',
        canActivate: [OrganizationContractListGuard],
        canDeactivate: [OrganizationContractListGuard],
        children: [
          {
            path: '',
            canActivate: [MovieOrganizationListGuard],
            canDeactivate: [MovieOrganizationListGuard],
            loadChildren: () => import('./title/list/list.module').then((m) => m.TitleListModule),
          },
          {
            path: 'lobby',
            loadChildren: () =>
              import('@blockframes/movie/form/start/start-tunnel.module').then(
                (m) => m.StartTunnelModule
              ),
          },
          {
            path: ':movieId',
            canActivate: [MovieActiveGuard, MovieTunnelGuard],
            canDeactivate: [MovieActiveGuard],
            loadChildren: () => import('./title/view/view.module').then((m) => m.TitleViewModule),
            data: { redirect: '/c/o/dashboard/title' },
          },
        ],
      },
      {
        path: 'deals',
        children: [
          {
            path: '',
            canActivate: [
              OrganizationContractListGuard,
              ContractsRightListGuard,
              MovieListContractListGuard,
            ],
            canDeactivate: [
              OrganizationContractListGuard,
              ContractsRightListGuard,
              MovieListContractListGuard,
            ],
            loadChildren: () => import('./right/list/list.module').then((m) => m.RightListModule),
          },
          {
            path: ':contractId', // One right: different state of a right (offer, counter-offer, payment),
            canActivate: [ActiveContractGuard],
            canDeactivate: [ActiveContractGuard],
            loadChildren: () => import('./right/view/view.module').then((m) => m.RightViewModule),
          },
        ],
      },
      {
        path: 'contact',
        loadChildren: () =>
          import('@blockframes/ui/contact-us/contact.module').then(
            (m) => m.ContactModule
          ),
      },
      {
        path: 'terms',
        loadChildren: () =>
          import('@blockframes/auth/components/terms-conditions/terms-conditions.module').then(
            (m) => m.TermsConditionsModule
          ),
      },
      {
        path: 'privacy',
        loadChildren: () =>
          import('@blockframes/auth/components/privacy-policy/privacy-policy.module').then(
            (m) => m.PrivacyPolicyModule
          ),
      },
    ],
  },
  {
    path: 'tunnel',
    canActivate: [TunnelGuard],
    children: [
      {
        path: 'movie',
        children: [
          {
            path: ':movieId',
            canActivate: [MovieActiveGuard, MovieTunnelGuard],
            canDeactivate: [MovieActiveGuard],
            children: tunnelRoutes,
            data: {
              redirect: '/c/o/dashboard/tunnel/movie',
            },
          },
        ],
      },
      {
        path: 'contract',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('@blockframes/contract/contract/tunnel').then(
                (m) => m.ContractTunnelLobbyModule
              ),
          },
          {
            path: ':contractId',
            canActivate: [ActiveContractGuard],
            canDeactivate: [ActiveContractGuard],
            loadChildren: () =>
              import('@blockframes/contract/contract/tunnel').then((m) => m.ContractTunnelModule),
            data: {
              redirect: '/c/o/dashboard/tunnel/contract',
            },
          },
        ],
      },
    ],
  },
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
    MovieFormShellModule,

    // Material
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    {
      provide: FORMS_CONFIG,
      useFactory: (movie) => ({ movie }),
      deps: [MovieShellConfig],
    },
  ],
})
export class DashboardModule { }
