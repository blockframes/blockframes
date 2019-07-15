import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'

// Components
import { NotificationListComponent } from './notification/notification-list/notification-list.component';
import { NotificationItemComponent } from './notification/notification-item/notification-item.component';
import { NotificationWidgetComponent } from './notification-widget/notification-widget.component';

// Modules
import { UtilsModule } from '@blockframes/utils';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [NotificationListComponent, NotificationItemComponent, NotificationWidgetComponent,],
  imports: [
    CommonModule,
    RouterModule,
    UtilsModule,

    // Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatBadgeModule,
    MatListModule,
  ],
  exports: [NotificationListComponent, NotificationWidgetComponent,]
})
export class NotificationModule { }
