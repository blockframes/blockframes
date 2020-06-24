import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgComponent } from './img.component';

@NgModule({
  declarations: [ImgComponent],
  exports: [ImgComponent],
  imports: [CommonModule]
})
export class ImgModule { }
