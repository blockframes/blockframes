import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TermToPrettyDatePipe } from './to-pretty-date.pipe';

@NgModule({
  declarations: [TermToPrettyDatePipe],
  imports: [CommonModule],
  exports: [TermToPrettyDatePipe]
})
export class TermToPrettyDateModule {}
