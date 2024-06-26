﻿// Angular
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
import { WaterfallAdminGuard } from '@blockframes/waterfall/guards/waterfall-admin.guard';
import { WaterfallActiveGuard } from '@blockframes/waterfall/guards/waterfall-active.guard';

// Material
import { MatListModule} from '@angular/material/list';
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
          loadChildren: () => import('@blockframes/waterfall/dashboard/edit-title/edit.module').then(m => m.WaterfallEditTitleModule),
        },
        {
          path: ':movieId',
          canActivate: [WaterfallActiveGuard, MovieActiveGuard, MovieTunnelGuard],
          children: [
            {
              path: '',
              loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule),
              data: { redirect: '/c/o/dashboard/home' }
            },
            {
              path: 'init',
              data: { createMode: true, redirect: '/c/o/dashboard/home' },
              canActivate: [WaterfallAdminGuard],
              loadChildren: () => import('./title/waterfall-edit/waterfall-edit.module').then(m => m.WaterfallEditModule),
            },
            {
              path: 'edit',
              data: { createMode: false },
              loadChildren: () => import('@blockframes/waterfall/dashboard/edit-title/edit.module').then(m => m.WaterfallEditTitleModule),
            },
            {
              path: 'right-holders-management',
              loadChildren: () => import('./title/right-holders-management/right-holders-management.module').then(m => m.RightHoldersManagementModule),
            },
            {
              path: 'statement',
              loadChildren: () => import('./statement/statement.module').then(m => m.StatementModule),
            },
            {
              path: 'document',
              loadChildren: () => import('./document/document.module').then(m => m.DocumentModule),
            },
            {
              path: 'amortization-edit',
              canActivate: [WaterfallAdminGuard],
              loadChildren: () => import('./amortization/amortization.module').then(m => m.AmortizationModule),
            },
          ],
        },
      ],
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
    },
    {
      path: 'security',
      loadChildren: () => import('@blockframes/ui/static-informations/security/security.module').then(m => m.SecurityModule)
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
