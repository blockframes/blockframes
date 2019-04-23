import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Components
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';

//Material
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [NotificationListComponent, NotificationItemComponent],
  imports: [
    CommonModule,

    //Material
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
  ],
  exports: [NotificationListComponent]
})
export class NotificationModule { }
