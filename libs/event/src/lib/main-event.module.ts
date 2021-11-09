import { NgModule } from '@angular/core';
import { MainEventComponent } from './main-event.component';
import { AsideModule } from '@blockframes/ui/layout/marketplace/aside/aside.module';
import { EventLayoutModule } from '@blockframes/ui/layout/event/event.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Guards
import { EventAccessGuard } from './guard/event-access.guard';
import { EventGuard } from './guard/event.guard';
import { SessionGuard } from './guard/session.guard';
import { InvitationGuard } from '@blockframes/invitation/guard/invitations.guard';
import { NotificationsGuard } from '@blockframes/notification/notifications.guard';
import { NoEventAuthGuard } from './guard/no-event-auth.guard';
import { NoEventIdentityGuard } from './guard/no-event-identity.guard';
import { NoEventRoleGuard } from './guard/no-event-role.guard';
import { IdentityGuard } from './guard/identity.guard';
import { EventAuthGuard } from './guard/event-auth.guard';

// Material
import { MatIconModule } from '@angular/material/icon';

const routes: Routes = [
  {
    path: ':eventId',
    canActivate: [EventAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'r',
        pathMatch: 'full'
      },
      {
        path: 'auth',
        children: [
          {
            path: '',
            redirectTo: 'role',
            pathMatch: 'full'
          },
          {
            path: 'role',
            canActivate: [NoEventRoleGuard],
            loadChildren: () => import('./pages/role/role.module').then(m => m.RoleModule),
          },
          {
            path: 'identity',
            canActivate: [NoEventIdentityGuard],
            loadChildren: () => import('./pages/identity/identity.module').then(m => m.IdentityModule),
          },
          {
            path: 'email',
            canActivate: [NoEventIdentityGuard],
            loadChildren: () => import('./pages/email/email.module').then(m => m.EmailModule),
          },
          {
            path: 'login',
            canActivate: [NoEventAuthGuard],
            loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
          },
        ]
      },
      {
        path: 'r',
        canActivate: [IdentityGuard, InvitationGuard, NotificationsGuard],
        canDeactivate: [InvitationGuard, NotificationsGuard],
        children: [
          {
            path: '',
            redirectTo: 'i',
            pathMatch: 'full'
          },
          {
            path: 'i',
            component: MainEventComponent,
            canActivate: [EventAccessGuard],
            children: [
              {
                path: '',
                loadChildren: () => import('./pages/view/view.module').then(m => m.EventViewModule),
              },
              {
                path: 'session',
                canActivate: [EventGuard, SessionGuard],
                canDeactivate: [EventGuard],
                loadChildren: () => import('./pages/session/session.module').then(m => m.SessionModule),
              },
              {
                path: 'lobby',
                canActivate: [EventGuard],
                canDeactivate: [EventGuard],
                loadChildren: () => import('./pages/lobby/lobby.module').then(m => m.LobbyModule),
              },
              {
                path: 'ended',
                canActivate: [EventGuard],
                loadChildren: () => import('./pages/ended/meeting-ended.module').then(m => m.MeetingEndedModule),
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '**',
    loadChildren: () => import('@blockframes/ui/error/error-not-found.module').then(m => m.ErrorNotFoundModule)
  }
];

@NgModule({
  declarations: [MainEventComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FlexLayoutModule,
    EventLayoutModule,
    AsideModule,
    MatIconModule,
  ]
})
export class MainModule { }
