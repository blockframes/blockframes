import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { NotificationListModule } from '../notification-list/notification-list.module';
import { InvitationModule } from '../../invitation/invitation.module';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget';

// Components
import { NotificationWidgetComponent } from './notification-widget.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatToolbarModule } from '@angular/material/toolbar';

@NgModule({
  declarations: [NotificationWidgetComponent],
  exports: [NotificationWidgetComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

    NotificationListModule,
    InvitationModule,
    OverlayWidgetModule,

    // Material
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatBadgeModule,
    MatToolbarModule
  ],
})
export class NotificationWidgetModule {}
