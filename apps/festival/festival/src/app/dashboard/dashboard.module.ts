// Angular
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
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';
import { EventFormShellComponent } from '@blockframes/event/form/shell/shell.component';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';
import { ReviewComponent } from '@blockframes/event/layout/review/review.component';
import { LayoutEventReviewModule } from '@blockframes/event/layout/review/review.module';

// Tunnel routes
import { tunnelRoutes } from './tunnel/movie-tunnel.routes';

// Guards
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { EventOrganizationGuard } from "@blockframes/event/guard/event-organization.guard";
import { EventEditGuard } from '@blockframes/event/guard/event-edit.guard';
import { EventTypeGuard } from '@blockframes/event/guard/event-type.guard';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';

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
      loadChildren: () => import('@blockframes/movie/import/import.module').then(m => m.TitleImportModule),
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
              component: ReviewComponent,
              children: [
                {
                  path: '',
                  pathMatch: 'full',
                  redirectTo: 'invitations'
                },
                {
                  path: 'invitations',
                  loadChildren: () => import('@blockframes/event/pages/guest-list/guest-list.module').then(m => m.GuestListModule),
                  data: { animation: 0 }
                },
                {
                  path: 'statistics',
                  loadChildren: () => import('@blockframes/event/pages/analytics/analytics.module').then(m => m.AnalyticsModule),
                  data: { animation: 1 }
                }
              ],
            }, {
              path: 'edit',
              component: EventFormShellComponent,
              canActivate: [EventEditGuard],
              canDeactivate: [EventOrganizationGuard],
              children: [
                {
                  path: '',
                  canActivate: [EventTypeGuard],
                },
                {
                  path: 'screening',
                  loadChildren: () => import('@blockframes/event/form/screening/screening.module').then(m => m.ScreeningModule),
                  data: { animation: 0 }
                },
                {
                  path: 'meeting',
                  loadChildren: () => import('@blockframes/event/form/meeting/meeting.module').then(m => m.MeetingModule),
                  data: { animation: 1 }
                },
                {
                  path: 'slate',
                  loadChildren: () => import('@blockframes/event/form/slate/slate.module').then(m => m.SlateModule),
                  data: { animation: 2 }
                },
                {
                  path: 'invitations',
                  loadChildren: () => import('@blockframes/event/form/invitation/invitation.module').then(m => m.InvitationModule),
                  data: { animation: 3 }
                },
                {
                  path: 'files',
                  loadChildren: () => import('@blockframes/event/form/meeting-files/meeting-files.module').then(m => m.MeetingFilesModule),
                  data: { animation: 4 }
                },
                {
                  path: 'statistics',
                  loadChildren: () => import('@blockframes/event/pages/analytics/analytics.module').then(m => m.AnalyticsModule),
                  data: { animation: 5 }
                }
              ],
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
    EventFromShellModule,
    LayoutEventReviewModule,

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
