import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

@NgModule({
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
  imports: [
    ImageReferenceModule,
    CommonModule,
  ]
})
export class EventEmptyModule { }
