import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventReviewComponent } from './review.component';

import { LayoutEventReviewModule } from '@blockframes/event/layout/review/review.module';
import { EventAnalyticsModule } from '@blockframes/event/components/analytics/analytics.module';

@NgModule({
  declarations: [EventReviewComponent],
  imports: [
    CommonModule,
    LayoutEventReviewModule,
    EventAnalyticsModule,
    RouterModule.forChild([{ path: '', component: EventReviewComponent }])
  ]
})
export class EventReviewModule { }
