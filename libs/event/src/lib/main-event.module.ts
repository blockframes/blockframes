import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Guards
import { EventAccessGuard } from './guard/event-access.guard';
import { EventGuard } from './guard/event.guard';
import { EventActiveGuard } from './guard/event-active.guard';
import { SessionGuard } from './guard/session.guard';
import { IdentityCheckGuard } from './guard/identity-check-guard';
import { EventRoleGuard } from './guard/event-role.guard';
import { InvitationGuard } from '@blockframes/invitation/guard/invitations.guard';
import { NotificationsGuard } from '@blockframes/notification/notifications.guard';

const routes: Routes = [
  {
    path: ':eventId',
    canActivate: [EventActiveGuard, InvitationGuard, NotificationsGuard],
    canDeactivate: [EventActiveGuard, InvitationGuard, NotificationsGuard],
    children: [
      {
        path: '',
        canActivate: [IdentityCheckGuard],
        loadChildren: () => import('./pages/role/role.module').then(m => m.RoleModule),
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
            loadChildren: () => import('./pages/identity/identity.module').then(m => m.IdentityModule),
          },
          {
            path: 'email',
            loadChildren: () => import('./pages/email/email.module').then(m => m.EmailModule),
          },
          {
            path: 'email-verify',
            loadChildren: () => import('./pages/email-verify/email-verify.module').then(m => m.EmailVerifyModule),
          },
          {
            path: 'login',
            loadChildren: () => import('./pages/login/login.module').then(m => m.LoginModule),
          },
          {
            path: 'i',
            canActivate: [EventAccessGuard],
            children: [
              {
                path: '',
                canDeactivate: [EventActiveGuard],
                loadChildren: () => import('./pages/view/view.module').then(m => m.EventViewModule),
              },
              {
                path: 'session',
                canActivate: [EventGuard, SessionGuard],
                canDeactivate: [EventActiveGuard, EventGuard],
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
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class MainModule { }
