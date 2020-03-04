import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateEnumPipe } from './translate-enum.pipe';

@NgModule({
  declarations: [TranslateEnumPipe],
  imports: [CommonModule],
  exports: [TranslateEnumPipe]
})
export class TranslateEnumModule {}
