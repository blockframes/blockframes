// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { NotificationListModule } from '@blockframes/notification/components/list/list.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { NotificationComponent } from './notification.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NotificationListModule,
    ImageReferenceModule,
    RouterModule.forChild([{ path: '', component: NotificationComponent }]),

    MatIconModule,
    MatButtonModule
  ]
})
export class NotificationModule {}
