import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MissingPipe } from './missing.pipe';

@NgModule({
  declarations: [MissingPipe],
  imports: [CommonModule],
  exports: [MissingPipe]
})
export class MissingPipeModule {}
