import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivityTabsMobule } from '@blockframes/notification/activity-feed/activity-tabs/activity-tabs.module';
import { NoActivityModule } from '@blockframes/notification/activity-feed/no-activity/no-activity.module';

// Component
import { ActivityPageComponent } from './activity-page.component';


@NgModule({
  declarations: [ActivityPageComponent],
  imports: [
    CommonModule,
    ActivityTabsMobule,
    NoActivityModule,
    RouterModule.forChild([
      {
        path: '',
        component: ActivityPageComponent
      }
    ])
  ]
})
export class ActivityPageModule {}
