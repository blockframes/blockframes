// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { CardComponent } from './card.component';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';
import { DisplayNameModule } from '@blockframes/utils/pipes';


@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports: [
    CommonModule,
    ImageModule,
    FlexLayoutModule,
    MaxLengthModule,
    DisplayNameModule,
  ]
})
export class UserCardModule { }
