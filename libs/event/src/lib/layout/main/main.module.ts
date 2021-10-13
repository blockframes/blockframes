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
import { EventAuthGuard } from '../../guard/event-auth.guard';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';
import { EventGuard } from '../../guard/event.guard';
import { EventActiveGuard } from '../../guard/event-active.guard';
import { SessionGuard } from '@blockframes/event/guard/session.guard';
import { EventRoleGuard } from '@blockframes/event/guard/event-role.guard';

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
  canActivate: [MaintenanceGuard, EventAuthGuard],
  canDeactivate: [EventAuthGuard],
  children: [
    {
      path: '',
      canActivate: [EventActiveGuard],
      canDeactivate: [EventActiveGuard],
      loadChildren: () => import('./../../pages/role/role.module').then(m => m.RoleModule),
    },
    {
      path: 'login',
      loadChildren: () => import('./../../pages/login/login.module').then(m => m.LoginModule),
    },
    {
      path: 'r',
      canActivate: [EventActiveGuard, EventRoleGuard],
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
    },
    {
      path: 'public-access',
      canActivate: [EventActiveGuard],
      canDeactivate: [EventActiveGuard],
      loadChildren: () => import('./../../pages/public-access/public-access.module').then(m => m.PublicAccessModule),
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
