import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AvatarListModule } from '@blockframes/ui/avatar-list/avatar-list.module';
import { ReverseModule } from '@blockframes/utils/pipes/reverse.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Components
import { NotificationListComponent } from './notification-list/notification-list.component';
import { NotificationItemComponent } from './notification-item/notification-item.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    AvatarListModule,
    ReverseModule,
    ImageReferenceModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
  ],
  exports: [NotificationListComponent, NotificationItemComponent]
})
export class NotificationModule {}
