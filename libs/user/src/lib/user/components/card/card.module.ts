// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { CardComponent } from './card.component';

// Blockframes
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';


@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
    FlexLayoutModule,
    MaxLengthModule
  ]
})
export class UserCardModule { }
