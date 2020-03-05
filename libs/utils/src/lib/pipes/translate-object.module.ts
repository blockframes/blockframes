import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateObjectPipe } from './translate-object.pipe';

@NgModule({
  declarations: [TranslateObjectPipe],
  imports: [CommonModule],
  exports: [TranslateObjectPipe]
})
export class TranslateObjectModule {}
