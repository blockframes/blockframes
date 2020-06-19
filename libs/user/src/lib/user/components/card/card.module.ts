// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Component
import { CardComponent } from './card.component';

// Blockframes
import { ImgModule } from '@blockframes/ui/media/img/img.module';


@NgModule({
  declarations: [CardComponent],
  exports: [CardComponent],
  imports: [
    CommonModule,
    ImgModule,
    FlexLayoutModule,
  ]
})
export class UserCardModule { }
