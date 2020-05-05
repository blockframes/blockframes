import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
// Guards
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { MovieOrganizationListGuard } from '@blockframes/movie/guards/movie-organization-list.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

import { DashboardComponent } from './dashboard.component';
import { MatDividerModule } from '@angular/material/divider';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ImgAssetModule } from '@blockframes/ui/theme';


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
        canActivate: [MovieOrganizationListGuard],
        canDeactivate: [MovieOrganizationListGuard],
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'notifications',
        loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)
      },
      {
        path: 'invitations',
        loadChildren: () => import('./invitation/invitation.module').then(m => m.InvitationModule)
      },
      {
        path: 'import', // Import bulk of movies
        loadChildren: () => import('@blockframes/movie/components/import/import-movie.module')
          .then(m => m.ImportMovieModule)
      },
      {
        path: 'title',
        children: [{
          path: '',
          canActivate: [MovieOrganizationListGuard],
          canDeactivate: [MovieOrganizationListGuard],
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        }, {
          path: ':movieId',
          canActivate: [MovieActiveGuard],
          canDeactivate: [MovieActiveGuard],
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule)
        }]
      },
      {
        path: 'event',
        children: [{
          path: '',
          loadChildren: () => import('./event/list/list.module').then(m => m.EventListModule)
        }, {
          path: ':eventId',
          children: [{
            path: '',
            loadChildren: () => import('./event/review/review.module').then(m => m.EventReviewModule)
          },{
            path: 'edit',
            loadChildren: () => import('./event/edit/edit.module').then(m => m.EventEditModule)
          }, {
            path: 'session',
            loadChildren: () => import('@blockframes/event/layout/session/session.module').then(m => m.EventSessionModule)
          }]
        }]
      }
    ]
  }, {
    path: 'tunnel',
    canActivate: [TunnelGuard],
    children: [{
      path: 'movie',
      children: [{
        path: '',
        loadChildren: () => import('./tunnel/start/start-tunnel.module').then(m => m.StartTunnelModule)
      }, {
        path: ':movieId',
        canActivate: [MovieActiveGuard, MovieTunnelGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('./tunnel/movie-tunnel.module').then(m => m.MovieTunnelModule),
        data: {
          redirect: '/c/o/dashboard/tunnel/movie'
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
    ImgAssetModule,
    OrgNameModule,
    // Material
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatToolbarModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
