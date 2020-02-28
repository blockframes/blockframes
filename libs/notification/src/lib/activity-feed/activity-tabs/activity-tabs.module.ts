import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationListModule } from '@blockframes/notification/notification/notification-list/notification-list.module';
import { InvitationListModule } from '@blockframes/notification/invitation/invitation-list/invitation-list.module';

// Component
import { ActivityTabsComponent } from './activity-tabs.component';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [ActivityTabsComponent],
  imports: [
    CommonModule,
    NotificationListModule,
    InvitationListModule,

    // Material
    MatTabsModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  exports: [ActivityTabsComponent]
})
export class ActivityTabsMobule {}
