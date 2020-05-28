import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmptyComponent } from './empty.component';

@NgModule({
  declarations: [EmptyComponent],
  exports: [EmptyComponent],
  imports: [
    CommonModule,
  ]
})
export class EventEmptyModule { }
