import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ScreeningBackgroundPipe } from './card.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';


@NgModule({
  declarations: [CardComponent, ScreeningBackgroundPipe],
  exports: [CardComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
  ]
})
export class EventCardModule { }
