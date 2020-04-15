import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { NotificationComponent } from './notification.component';
import { NotificationListModule } from '@blockframes/notification/components/list/list.module';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule,
    NotificationListModule,
    RouterModule.forChild([{ path: '', component: NotificationComponent }])
  ]
})
export class NotificationModule {}
