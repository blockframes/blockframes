import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReversePipe } from './reverse.pipe';

@NgModule({
  declarations: [ReversePipe],
  imports: [CommonModule],
  exports: [ReversePipe]
})
export class ReverseModule {}
