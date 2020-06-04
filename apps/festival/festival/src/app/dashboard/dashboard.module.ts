import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Guards
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { TunnelGuard } from '@blockframes/ui/tunnel';
import { OrganizationContractListGuard } from '@blockframes/contract/contract/guards/organization-contract-list.guard';

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
        loadChildren: () => import('@blockframes/import').then(m => m.ImportModule)
      },
      {
        path: 'title',
        canActivate: [OrganizationContractListGuard],
        canDeactivate: [OrganizationContractListGuard],
        children: [{
          path: '',
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        }, {
          path: ':movieId',
          canActivate: [MovieActiveGuard],
          canDeactivate: [MovieActiveGuard],
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule),
          data: { redirect: '/c/o/dashboard/title' }
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
export class DashboardModule { }
