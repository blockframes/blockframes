import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ReviewComponent } from './review.component';

import { GuestListModule } from '@blockframes/invitation/components/guest-list/guest-list.module';
import { EventRangeModule } from '../../pipes/event-range.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [ReviewComponent],
  exports: [ReviewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    EventRangeModule,
    GuestListModule,
    AppBarModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class LayoutEventReviewModule { }
