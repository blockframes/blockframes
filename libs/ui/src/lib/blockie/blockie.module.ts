import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlockieComponent } from './blockie.component';

@NgModule({
  declarations: [BlockieComponent],
  imports: [
    CommonModule
  ],
  exports: [BlockieComponent],
  entryComponents: [BlockieComponent,]
})
export class BlockieModule { }
