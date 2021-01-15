// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { PrizeCardComponent } from './prize-card.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ToLabelModule } from '@blockframes/utils/pipes/to-label.pipe';

@NgModule({
  imports: [
    CommonModule,
    ImageModule,
    ToLabelModule,
  ],
  exports: [PrizeCardComponent],
  declarations: [PrizeCardComponent],
})
export class PrizeCardModule { }
