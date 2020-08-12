// Angular
import { NgModule } from '@angular/core';

// Component
import { FestivalPrizeCardComponent } from './festival-prize-card.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  imports: [ImageReferenceModule],
  exports: [FestivalPrizeCardComponent],
  declarations: [FestivalPrizeCardComponent],
})
export class FestivalPrizeCardModule { }
