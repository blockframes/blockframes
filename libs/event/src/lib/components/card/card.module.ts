import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, ScreeningBackgroundPipe } from './card.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';


@NgModule({
  declarations: [CardComponent, ScreeningBackgroundPipe],
  exports: [CardComponent],
  imports: [
    CommonModule,
    ImageModule,
  ]
})
export class EventCardModule { }
