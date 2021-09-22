import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventReviewComponent } from './review.component';
import { LayoutEventReviewModule } from '@blockframes/event/layout/review/review.module';
import { GuestListModule } from '@blockframes/event/pages/guest-list/guest-list.module';
import { GuestListComponent } from '@blockframes/event/pages/guest-list/guest-list.component';
import { AnalyticsModule } from '@blockframes/event/pages/analytics/analytics.module';
import { AnalyticsComponent } from '@blockframes/event/pages/analytics/analytics.component';

@NgModule({
  declarations: [EventReviewComponent],
  imports: [
    CommonModule,
    LayoutEventReviewModule,
    GuestListModule,
    AnalyticsModule,
    RouterModule.forChild([
      {
        path: '',
        component: EventReviewComponent,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'statistics'
          },
          {
            path: 'invitations',
            component: GuestListComponent,
            data: { animation: 1 }
          },
          {
            path: 'statistics',
            component: AnalyticsComponent,
            data: { animation: 2 }
          }
        ],
      }

    ])
  ]
})
export class EventReviewModule { }
