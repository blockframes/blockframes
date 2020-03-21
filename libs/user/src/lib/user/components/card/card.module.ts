import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CardComponent } from './card.component';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';



@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
    FlexLayoutModule,
  ]
})
export class UserCardModule { }
