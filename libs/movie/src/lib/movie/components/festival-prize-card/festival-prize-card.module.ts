// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { FestivalPrizeCardComponent } from './festival-prize-card.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  imports: [
    CommonModule,
    ImageReferenceModule
  ],
  exports: [FestivalPrizeCardComponent],
  declarations: [FestivalPrizeCardComponent],
})
export class FestivalPrizeCardModule { }
