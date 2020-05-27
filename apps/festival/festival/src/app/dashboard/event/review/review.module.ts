import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventReviewComponent } from './review.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { LayoutEventReviewModule } from '@blockframes/event/layout/review/review.module';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [EventReviewComponent],
  imports: [
    CommonModule,
    LayoutEventReviewModule,
    TableFilterModule,
    FlexLayoutModule,
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: EventReviewComponent }])
  ]
})
export class EventReviewModule { }
