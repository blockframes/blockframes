import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MissingSlugPipe } from './missing-slug.pipe';

@NgModule({
  declarations: [MissingSlugPipe],
  imports: [CommonModule],
  exports: [MissingSlugPipe]
})
export class MissingSlugPipeModule {}
