import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationListModule } from '@blockframes/notification/notification/notification-list/notification-list.module';
// Component
import { ActivityFeedComponent } from './activity-feed.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [ActivityFeedComponent],
  imports: [
    CommonModule,
    NotificationListModule,
    MatTabsModule,
    RouterModule.forChild([{ path: '', component: ActivityFeedComponent }]),
  ]
})
export class ActivityFeedModule {}