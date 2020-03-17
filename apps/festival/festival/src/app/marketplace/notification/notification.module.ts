import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { ActivityTabsMobule } from '@blockframes/notification/activity-feed/activity-tabs/activity-tabs.module';
import { NotificationComponent } from './notification.component';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule,
    ActivityTabsMobule,
    RouterModule.forChild([{ path: '', component: NotificationComponent }])
  ]
})
export class NotificationModule {}
