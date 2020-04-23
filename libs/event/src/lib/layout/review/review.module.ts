import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ReviewComponent } from './review.component';

import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { EventRangeModule } from '../../pipes/event-range.pipe';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [ReviewComponent],
  exports: [ReviewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    EventRangeModule,
    GuestListModule,
    // Material
    MatCardModule,
    MatIconModule,
  ]
})
export class LayoutEventReviewModule { }
