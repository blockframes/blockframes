﻿// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { MovieFormShellModule } from '@blockframes/movie/form/shell/shell.module';
import { MovieShellConfig } from '@blockframes/movie/form/movie.shell.config';
import { FORMS_CONFIG } from '@blockframes/movie/form/movie.shell.interfaces';

// Tunnel routes
import { tunnelRoutes } from './tunnel/movie-tunnel.routes';

// Guards
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { EventOrganizationGuard } from "@blockframes/event/guard/event-organization.guard";

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';

const routes: Routes = [{
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
      loadChildren: () => import('@blockframes/ui/dashboard/pages/home/home.module').then(m => m.HomeModule),
    },
    {
      path: 'notifications',
      loadChildren: () => import('@blockframes/notification/notification.module').then(m => m.NotificationModule)
    },
    {
      path: 'invitations',
      loadChildren: () => import('@blockframes/invitation/invitation.module').then(m => m.InvitationModule)
    },
    {
      path: 'import', // Import bulk of movies
      loadChildren: () => import('@blockframes/import').then(m => m.ImportModule)
    },
    {
      path: 'title',
      children: [{
        path: '',
        loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
      }, {
        path: 'lobby',
        loadChildren: () => import('@blockframes/movie/form/start/start-tunnel.module').then(m => m.StartTunnelModule)
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard, MovieTunnelGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule),
        data: { redirect: '/c/o/dashboard/title' }
      }]
    },
    {
      path: 'event',
      children: [
        {
          path: '',
          loadChildren: () => import('./event/list/list.module').then(m => m.EventListModule)
        }, {
          path: ':eventId',
          canActivate: [EventOrganizationGuard],
          children: [
            {
              path: '',
              loadChildren: () => import('./event/review/review.module').then(m => m.EventReviewModule)
            }, {
              path: 'edit',
              loadChildren: () => import('./event/edit/edit.module').then(m => m.EventEditModule)
            },
          ],
        },
      ],
    },
    {
      path: 'files',
      loadChildren: () => import('./files/files.module').then(m => m.FilesViewModule)
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
      path: ':movieId',
      canActivate: [MovieActiveGuard, MovieTunnelGuard],
      canDeactivate: [MovieActiveGuard],
      children: tunnelRoutes,
      data: {
        redirect: '/c/o/dashboard/tunnel/movie'
      },
    }]
  }]
},
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DashboardLayoutModule,
    ImageModule,
    OrgNameModule,
    ToLabelModule,
    OrgAccessModule,
    MovieFormShellModule,

    // Material
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule.forChild(routes)
  ],
  providers: [{
    provide: FORMS_CONFIG,
    useFactory: (movie) => ({ movie }),
    deps: [MovieShellConfig]
  }]
})
export class DashboardModule { }
