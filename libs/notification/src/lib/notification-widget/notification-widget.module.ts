import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Modules
import { NotificationModule } from '../notification/notification.module';
import { InvitationModule } from '../invitation/invitation.module';

// Components
import { NotificationWidgetComponent } from './notification-widget.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    NotificationWidgetComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

    NotificationModule,
    InvitationModule,

    // Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatListModule
  ],
  exports: [NotificationWidgetComponent]
})
export class NotificationWidgetModule {}
