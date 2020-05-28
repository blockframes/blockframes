import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NotificationComponent } from './notification.component';
import { NotificationListModule } from '@blockframes/notification/components/list/list.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NotificationListModule,
    ImageReferenceModule,
    RouterModule.forChild([{ path: '', component: NotificationComponent }])
  ]
})
export class NotificationModule {}
