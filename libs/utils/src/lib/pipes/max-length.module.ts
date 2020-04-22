import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MaxLength } from './max-length.pipe';

@NgModule({
  declarations: [MaxLength],
  imports: [CommonModule],
  exports: [MaxLength]
})
export class MaxLengthModule {}
