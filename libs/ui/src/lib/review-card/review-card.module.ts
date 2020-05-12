// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';

// Component
import { ReviewCardComponent } from './review-card.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaxLengthModule,

    // Material
    MatCardModule,
    MatButtonModule
  ],
  exports: [ReviewCardComponent],
  declarations: [ReviewCardComponent],
})
export class ReviewCardModule { }
