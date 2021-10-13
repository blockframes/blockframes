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

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { EventActiveGuard } from '../../guard/event-active.guard';


const routes: Routes = [{
  path: ':eventId',
  component: MainComponent,
  canActivate: [MaintenanceGuard, EventAuthGuard, EventAccessGuard],
  canDeactivate: [EventAuthGuard],
  children: [
    {
      path: '',
      canActivate: [EventActiveGuard],
      canDeactivate: [EventActiveGuard],
      loadChildren: () => import('./../../pages/view/view.module').then(m => m.EventViewModule),
    }, {
      path: 'session',
      canActivate: [EventActiveGuard],
      canDeactivate: [EventActiveGuard],
      loadChildren: () => import('./../../pages/session/session.module').then(m => m.SessionModule),
    },
    {
      path: 'lobby',
      canActivate: [EventActiveGuard, EventGuard],
      canDeactivate: [EventGuard],
      loadChildren: () => import('./../../pages/lobby/lobby.module').then(m => m.LobbyModule),
    },
    {
      path: 'ended',
      canActivate: [EventActiveGuard, EventGuard],
      loadChildren: () => import('./../../pages/ended/meeting-ended.module').then(m => m.MeetingEndedModule),
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

    // Angular
    CommonModule,
    FlexLayoutModule,

    // Modules
    AuthWidgetModule
  ]
})
export class MainModule { }
