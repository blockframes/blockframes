import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReviewComponent } from './review.component';
import { EventRangeModule } from '../../pipes/event-range.pipe';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { ToLabelModule } from '@blockframes/utils/pipes';
// Material
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
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
