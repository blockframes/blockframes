import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { NotificationListComponent } from './notification/notification-list/notification-list.component';
import { NotificationItemComponent } from './notification/notification-item/notification-item.component';
import { NotificationWidgetComponent } from './notification-widget/notification-widget.component';
import { InvitationListComponent } from './invitation/invitation-list/invitation-list.component';
import { InvitationItemComponent } from './invitation/invitation-item/invitation-item.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationItemComponent,
    NotificationWidgetComponent,
    InvitationListComponent,
    InvitationItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,

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
export class NotificationModule {}
