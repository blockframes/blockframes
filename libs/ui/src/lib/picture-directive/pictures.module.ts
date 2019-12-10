import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PicturesThemePathDirective } from './pictures.directive';


@NgModule({
  declarations: [PicturesThemePathDirective],
  imports: [
    CommonModule
  ],
  exports: [PicturesThemePathDirective]
})
export class PicturesModule {}
