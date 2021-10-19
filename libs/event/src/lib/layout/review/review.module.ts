import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReviewComponent } from './review.component';
import { EventRangeModule } from '../../pipes/event-range.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { ToLabelModule } from '@blockframes/utils/pipes';
// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
@NgModule({
  declarations: [ReviewComponent],
  exports: [ReviewComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    EventRangeModule,
    AppBarModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    ToLabelModule
  ]
})
export class LayoutEventReviewModule { }
