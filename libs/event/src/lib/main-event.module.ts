import { Component, NgModule } from '@angular/core';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

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

@Component({
  selector: 'event-main-component',
  template: '<router-outlet layout></router-outlet>',
})
export class MainEventComponent  {}

const routes: Routes = [
  {
    path: ':eventId',
    component: MainEventComponent,
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
  declarations: [MainEventComponent],
  imports: [
    RouterModule.forChild(routes),
    MatLayoutModule,
  ]
})
export class MainModule { }
