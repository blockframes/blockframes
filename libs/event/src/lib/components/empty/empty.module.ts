import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { ImageReferenceModule } from '@blockframes/ui/media';



@NgModule({
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
  imports: [
    CommonModule,
    ImageReferenceModule,
  ]
})
export class EventEmptyModule { }
