// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrizeCardComponent } from './prize-card.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

@NgModule({
  imports: [
    CommonModule,
    ImageReferenceModule,
    ToLabelModule,
  ],
  exports: [PrizeCardComponent],
  declarations: [PrizeCardComponent],
})
export class PrizeCardModule { }
