﻿// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule, Routes } from '@angular/router';

// Component
import { DashboardComponent } from './dashboard.component';

// Blockframes
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { MovieFormShellModule } from '@blockframes/movie/form/shell/shell.module';
import { MovieShellConfig } from '@blockframes/movie/form/movie.shell.config';
import { FORMS_CONFIG } from '@blockframes/movie/form/movie.shell.interfaces';
import { OrgAccessModule } from '@blockframes/organization/pipes';
import { SidenavAuthModule } from '@blockframes/auth/components/sidenav-auth/sidenav-auth.module';
import { SidenavWidgetModule } from '@blockframes/auth/components/sidenav-widget/sidenav-widget.module';

// Guards
import { TunnelGuard } from '@blockframes/ui/tunnel/tunnel.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';

// Material
import { MatListModule} from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

// Tunnel routes
import { tunnelRoutes } from './tunnel/movie-tunnel.routes';
import { CatalogSaleShellGuard } from './sales/shell/shell.guard';

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
        loadChildren: () => import('@blockframes/ui/dashboard/pages/home/home.module').then(m => m.HomeModule)
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
        loadChildren: () => import('@blockframes/movie/import/import.module').then(m => m.TitleImportModule),
      },
      {
        path: 'sales',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadChildren: () => import('./sales/list/list.module').then(m => m.CatalogSaleListModule)
          },
          {
            path: 'import',
            loadChildren: () => import('@blockframes/contract/import/import.module').then(m => m.ContractImportModule)
          },
          {
            path: ':saleId',
            canActivate: [CatalogSaleShellGuard],
            loadChildren: () => import('./sales/shell/shell.module').then(m => m.CatalogSaleShellModule)
          },
        ]
      },
      {
        path: 'avails',
        children: [
          {
            path: '',
            pathMatch: 'full',
            loadChildren: () => import('./avails/list/list.module').then(m => m.CatalogAvailsListModule)
          },
          {
            path: 'select',
            loadChildren: () => import('./avails/select-title/select-title.module').then(m => m.CatalogAvailsSelectTitleModule)
          },
          {
            path: 'select/:titleId/manage',
            loadChildren: () => import('./avails/manage/manage.module').then(m => m.CatalogManageAvailsModule)
          },
          {
            path: ':titleId',
            loadChildren: () => import('./avails/shell/shell.module').then(m => m.CatalogAvailsShellModule)
          },
        ]
      },
      {
        path: 'title',
        children: [{
          path: '',
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        },
        {
          path: 'lobby',
          loadChildren: () => import('@blockframes/movie/form/start/start-tunnel.module').then(m => m.StartTunnelModule)
        },
        {
          path: ':movieId',
          canActivate: [MovieActiveGuard, MovieTunnelGuard],
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule),
          data: { redirect: '/c/o/dashboard/title' }
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
      },
      {
        path: 'cookies',
        loadChildren: () => import('@blockframes/ui/static-informations/cookies/cookies.module').then(m => m.CookiesModule)
      }
    ]
  },
  {
    path: 'tunnel',
    canActivate: [TunnelGuard],
    children: [{
      path: 'movie',
      children: [{
        path: ':movieId',
        canActivate: [MovieActiveGuard, MovieTunnelGuard],
        children: tunnelRoutes,
        data: {
          redirect: '/c/o/dashboard/tunnel/movie'
        },
      }]
    }]
  },
  {
    path: 'standard-terms',
    loadChildren: () => import('@blockframes/contract/contract/pages/standard-terms/standard-terms.module').then(m => m.StandardTermsModule)
  }
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DashboardLayoutModule,
    ImageModule,
    ToLabelModule,
    MovieFormShellModule,
    OrgAccessModule,
    RouterModule.forChild(routes),
    SidenavAuthModule,
    SidenavWidgetModule,

    // Material
    MatListModule,
    MatIconModule
  ],
  providers: [{
    provide: FORMS_CONFIG,
    useFactory: (movie) => ({ movie }),
    deps: [MovieShellConfig]
  }]
})
export class DashboardModule { }
