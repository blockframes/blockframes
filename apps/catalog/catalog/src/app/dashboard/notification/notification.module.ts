import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NotificationListModule } from '@blockframes/notification/components/list/list.module';
import { ImgModule } from '@blockframes/ui/media/img/img.module';
import { NotificationComponent } from './notification.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [NotificationComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    NotificationListModule,
    ImgModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: NotificationComponent }])
  ]
})
export class NotificationModule {}
