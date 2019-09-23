import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';

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
    NotificationItemComponent
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
  exports: [NotificationListComponent]
})
export class NotificationModule {}
