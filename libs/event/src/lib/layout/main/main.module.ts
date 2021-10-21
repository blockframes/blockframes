import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Components
import { MainComponent } from './main.component';

// Modules 
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { FooterModule } from '@blockframes/ui/layout/footer/footer.module';

// Guards
import { EventAccessGuard } from '../../guard/event-access.guard';
import { EventGuard } from '../../guard/event.guard';
import { EventActiveGuard } from '../../guard/event-active.guard';
import { SessionGuard } from '../../guard/session.guard';
import { IdentityCheckGuard } from '../../guard/identity-check-guard';
import { AnonymousAuthGuard } from '@blockframes/auth/guard/anonymous-auth-guard';
import { EventRoleGuard } from '../../guard/event-role.guard';
import { InvitationGuard } from '@blockframes/invitation/guard/invitations.guard';
import { NotificationsGuard } from '@blockframes/notification/notifications.guard';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Routes = [{
  path: ':eventId',
  component: MainComponent,
  canActivate: [AnonymousAuthGuard, EventActiveGuard, InvitationGuard, NotificationsGuard],
  canDeactivate: [AnonymousAuthGuard, EventActiveGuard, InvitationGuard, NotificationsGuard],
  children: [
    {
      path: '',
      canActivate: [IdentityCheckGuard],
      loadChildren: () => import('./../../pages/role/role.module').then(m => m.RoleModule),
    },
    {
      path: 'r',
      canActivate: [EventRoleGuard],
      children: [
        {
          path: '',
          redirectTo: 'i',
          pathMatch: 'full'
        },
        {
          path: 'identity',
          loadChildren: () => import('./../../pages/identity/identity.module').then(m => m.IdentityModule),
        },
        {
          path: 'email',
          loadChildren: () => import('./../../pages/email/email.module').then(m => m.EmailModule),
        },
        {
          path: 'email-verify',
          loadChildren: () => import('./../../pages/email-verify/email-verify.module').then(m => m.EmailVerifyModule),
        },
        {
          path: 'login',
          loadChildren: () => import('./../../pages/login/login.module').then(m => m.LoginModule),
        },
        {
          path: 'i',
          canActivate: [EventAccessGuard],
          children: [
            {
              path: '',
              canDeactivate: [EventActiveGuard],
              loadChildren: () => import('./../../pages/view/view.module').then(m => m.EventViewModule),
            },
            {
              path: 'session',
              canActivate: [EventGuard, SessionGuard],
              canDeactivate: [EventActiveGuard, EventGuard],
              loadChildren: () => import('./../../pages/session/session.module').then(m => m.SessionModule),
            },
            {
              path: 'lobby',
              canActivate: [EventGuard],
              canDeactivate: [EventGuard],
              loadChildren: () => import('./../../pages/lobby/lobby.module').then(m => m.LobbyModule),
            },
            {
              path: 'ended',
              canActivate: [EventGuard],
              loadChildren: () => import('./../../pages/ended/meeting-ended.module').then(m => m.MeetingEndedModule),
            }
          ]
        }
      ]
    }
  ]
}];

@NgModule({
  declarations: [MainComponent],
  imports: [
    RouterModule.forChild(routes),
    AppBarModule,
    AppLogoModule,
    FooterModule,

    // Material
    MatToolbarModule,
    MatListModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatSnackBarModule,

    // Angular
    CommonModule,
    FlexLayoutModule,

    // Modules
    AuthWidgetModule
  ]
})
export class MainModule { }
