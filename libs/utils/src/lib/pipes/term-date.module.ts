import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TermDatePipe } from './term-date.pipe';

@NgModule({
  declarations: [TermDatePipe],
  imports: [CommonModule],
  exports: [TermDatePipe]
})
export class TermDateModule {}
