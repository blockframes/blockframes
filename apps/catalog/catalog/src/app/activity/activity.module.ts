import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme';
import { ActivityTabsMobule } from '@blockframes/notification/activity-feed/activity-tabs/activity-tabs.module';

// Component
import { ActivityComponent } from './activity.component';

@NgModule({
  declarations: [ActivityComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImgAssetModule,
    ActivityTabsMobule,
    RouterModule.forChild([
      {
        path: '',
        component: ActivityComponent
      }
    ])
  ]
})
export class ActivityModule {}
