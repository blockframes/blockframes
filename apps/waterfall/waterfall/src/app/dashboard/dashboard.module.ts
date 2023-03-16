// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { MovieFormShellModule } from '@blockframes/movie/form/shell/shell.module';
import { MovieShellConfig } from '@blockframes/movie/form/movie.shell.config';
import { FORMS_CONFIG } from '@blockframes/movie/form/movie.shell.interfaces';
import { OrgAccessModule } from '@blockframes/organization/pipes/org-access.pipe';
import { EventFromShellModule } from '@blockframes/event/form/shell/shell.module';
import { LayoutEventReviewModule } from '@blockframes/event/layout/review/review.module';
import { SidenavAuthModule } from '@blockframes/auth/components/sidenav-auth/sidenav-auth.module';
import { SidenavWidgetModule } from '@blockframes/auth/components/sidenav-widget/sidenav-widget.module';


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
      path: 'home',
      children: [
        {
          path: '',
          loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
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
    ImageModule,
    ToLabelModule,
    OrgAccessModule,
    MovieFormShellModule,
    EventFromShellModule,
    LayoutEventReviewModule,
    SidenavAuthModule,
    SidenavWidgetModule,

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
