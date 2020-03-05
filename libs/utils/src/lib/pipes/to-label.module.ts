import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ToLabelPipe } from './to-label.pipe';

@NgModule({
  declarations: [ToLabelPipe],
  imports: [CommonModule],
  exports: [ToLabelPipe]
})
export class ToLabelModule {}
