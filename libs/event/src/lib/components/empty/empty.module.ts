import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { ImgModule } from '@blockframes/ui/media/img/img.module';

@NgModule({
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
  imports: [
    ImgModule,
    CommonModule,
  ]
})
export class EventEmptyModule { }
