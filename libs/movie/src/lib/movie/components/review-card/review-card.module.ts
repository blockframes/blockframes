import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardComponent } from './review-card.component';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [ReviewCardComponent],
  exports: [ReviewCardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    MaxLengthModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class ReviewCardModule { }
