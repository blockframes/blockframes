import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

// Routes
import { RouterModule, Routes } from '@angular/router';

// Components
import { EventComponent } from './event.component';

// Modules 
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { FooterModule } from '@blockframes/ui/layout/footer/footer.module';

// Guards
import { EventAccessGuard } from '../guard/event-access.guard';
import { EventAuthGuard } from '../guard/event-auth.guard';
import { EventActiveGuard } from '../guard/event-active.guard';
import { MaintenanceGuard } from '@blockframes/ui/maintenance';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';

const routes: Routes = [{
  path: ':eventId',
  component: EventComponent,
  canActivate: [MaintenanceGuard, EventAuthGuard, EventActiveGuard, EventAccessGuard],
  canDeactivate: [EventAuthGuard, EventActiveGuard],
}];

@NgModule({
  declarations: [EventComponent],
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
export class EventModule { } // @TODO #6756 rename
