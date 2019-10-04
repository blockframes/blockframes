import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateSlugPipe } from './translate-slug.pipe';

@NgModule({
  declarations: [TranslateSlugPipe],
  imports: [CommonModule],
  exports: [TranslateSlugPipe]
})
export class TranslateSlugModule {}
