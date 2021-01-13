import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

@NgModule({
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
  imports: [
    ImageModule,
    CommonModule,
  ]
})
export class EventEmptyModule { }
