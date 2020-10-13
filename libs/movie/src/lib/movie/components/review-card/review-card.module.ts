import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardComponent } from './review-card.component';

import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [ReviewCardComponent],
  exports: [ReviewCardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,
    MaxLengthModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class ReviewCardModule { }
