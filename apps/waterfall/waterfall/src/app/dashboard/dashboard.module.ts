// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { FORMS_CONFIG } from '@blockframes/movie/form/movie.shell.interfaces';
import { MovieShellConfig } from '@blockframes/movie/form/movie.shell.config';
import { MovieTunnelGuard } from '@blockframes/movie/guards/movie-tunnel.guard';
import { MovieActiveGuard } from '@blockframes/movie/guards/movie-active.guard';
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { SidenavAuthModule } from '@blockframes/auth/components/sidenav-auth/sidenav-auth.module';
import { SidenavWidgetModule } from '@blockframes/auth/components/sidenav-widget/sidenav-widget.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

// Component
import { DashboardComponent } from './dashboard.component';


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
      path: 'home',
      children: [
        {
          path: '',
          loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
        }
      ]
    },
    {
      path: 'title',
      children: [
        {
          path: '',
          pathMatch: 'full',
          redirectTo: '/c/o/dashboard/home',
        },
        {
          path: 'create',
          data: { createMode: true },
          loadChildren: () => import('@blockframes/waterfall/components/edit/edit.module').then(m => m.WaterfallEditFormModule),
        },
        {
          path: ':movieId',
          children: [
            {
              path: '',
              canActivate: [MovieActiveGuard, MovieTunnelGuard],
              loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule),
              data: { redirect: '/c/o/dashboard/home' }
            },
            {
              path: 'edit',
              data: { createMode: false },
              loadChildren: () => import('@blockframes/waterfall/components/edit/edit.module').then(m => m.WaterfallEditFormModule),
            },
            {
              path: 'right-holders',
              loadChildren: () => import('./title/right-holders/right-holders.module').then(m => m.RightHoldersModule),
            },
          ],
        },
      ],
    },
    {
      path: 'graph',
      children: [
        {
          path: '',
          redirectTo: 'terrawilly-group',
          pathMatch: 'full'
        },
        {
          path: ':waterfallId',
          loadChildren: () => import('./graph/graph.module').then(m => m.GraphModule),
        }
      ]
    },
    {
      path: 'table',
      children: [
        {
          path: '',
          loadChildren: () => import('./table/table.module').then(m => m.TableModule),
        }
      ]
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
];

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DashboardLayoutModule,
    SidenavAuthModule,
    SidenavWidgetModule,

    // Material
    MatListModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ],
  providers: [{
    provide: FORMS_CONFIG,
    useFactory: (movie) => ({ movie }),
    deps: [MovieShellConfig]
  }]
})
export class DashboardModule { }
