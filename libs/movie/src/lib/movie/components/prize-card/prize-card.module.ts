// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrizeCardComponent } from './prize-card.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  imports: [
    CommonModule,
    ImageReferenceModule
  ],
  exports: [PrizeCardComponent],
  declarations: [PrizeCardComponent],
})
export class PrizeCardModule { }
