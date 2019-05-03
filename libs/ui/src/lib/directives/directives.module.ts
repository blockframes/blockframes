import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DotColorDirective } from './dot-color-directive';

@NgModule({
  declarations: [DotColorDirective],
  imports: [CommonModule],
  exports: [DotColorDirective]
})
export class DirectivesModule {}
