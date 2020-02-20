import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationListModule } from '@blockframes/notification/notification/notification-list/notification-list.module';
// Component
import { ActivityFeedComponent } from './activity-feed.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [ActivityFeedComponent],
  imports: [
    CommonModule,
    NotificationListModule,
    MatTabsModule,
    MatCardModule,
    RouterModule.forChild([{ path: '', component: ActivityFeedComponent }]),
  ]
})
export class ActivityFeedModule {}