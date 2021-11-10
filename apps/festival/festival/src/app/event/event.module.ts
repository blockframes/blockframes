import { NgModule } from '@angular/core';
import { EventComponent } from './event.component';
import { AsideModule } from './../marketplace/layout/aside/aside.module';
import { EventLayoutModule } from '@blockframes/ui/layout/event/event.module';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Guards
import { EventAccessGuard } from '@blockframes/event/guard/event-access.guard';
import { EventGuard } from '@blockframes/event/guard/event.guard';
import { SessionGuard } from '@blockframes/event/guard/session.guard';
import { InvitationGuard } from '@blockframes/invitation/guard/invitations.guard';
import { NotificationsGuard } from '@blockframes/notification/notifications.guard';
import { NoEventAuthGuard } from '@blockframes/event/guard/no-event-auth.guard';
import { NoEventIdentityGuard } from '@blockframes/event/guard/no-event-identity.guard';
import { NoEventRoleGuard } from '@blockframes/event/guard/no-event-role.guard';
import { IdentityGuard } from '@blockframes/event/guard/identity.guard';
import { EventAuthGuard } from '@blockframes/event/guard/event-auth.guard';

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
            loadChildren: () => import('./role/role.module').then(m => m.RoleModule),
          },
          {
            path: 'identity',
            canActivate: [NoEventIdentityGuard],
            loadChildren: () => import('./identity/identity.module').then(m => m.IdentityModule),
          },
          {
            path: 'email',
            canActivate: [NoEventIdentityGuard],
            loadChildren: () => import('./email/email.module').then(m => m.EmailModule),
          },
          {
            path: 'login',
            canActivate: [NoEventAuthGuard],
            loadChildren: () => import('./login/login.module').then(m => m.LoginModule),
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
            component: EventComponent,
            canActivate: [EventAccessGuard],
            children: [
              {
                path: '',
                loadChildren: () => import('./view/view.module').then(m => m.EventViewModule),
              },
              {
                path: 'session',
                canActivate: [EventGuard, SessionGuard],
                canDeactivate: [EventGuard],
                loadChildren: () => import('./session/session.module').then(m => m.SessionModule),
              },
              {
                path: 'lobby',
                canActivate: [EventGuard],
                canDeactivate: [EventGuard],
                loadChildren: () => import('./lobby/lobby.module').then(m => m.LobbyModule),
              },
              {
                path: 'ended',
                canActivate: [EventGuard],
                loadChildren: () => import('./ended/meeting-ended.module').then(m => m.MeetingEndedModule),
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
  declarations: [EventComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FlexLayoutModule,
    EventLayoutModule,
    AsideModule,
    MatIconModule,
    ImageModule
  ]
})
export class EventModule { }
