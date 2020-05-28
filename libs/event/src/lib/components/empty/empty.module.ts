import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';
import { ImgAssetModule } from '@blockframes/ui/theme';



@NgModule({
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
  imports: [
    CommonModule,
    ImgAssetModule,
  ]
})
export class EventEmptyModule { }
