// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { DashboardLayoutModule } from '@blockframes/ui/layout/dashboard/dashboard.module';
import { SidenavAuthModule } from '@blockframes/auth/components/sidenav-auth/sidenav-auth.module';
import { SidenavWidgetModule } from '@blockframes/auth/components/sidenav-widget/sidenav-widget.module';

// Material
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

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
    SidenavAuthModule,
    SidenavWidgetModule,

    // Material
    MatListModule,
    MatIconModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
