import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DisplayNamePipe } from './display-name.pipe';

@NgModule({
  declarations: [DisplayNamePipe],
  imports: [CommonModule],
  exports: [DisplayNamePipe]
})
export class DisplayNameModule {}
