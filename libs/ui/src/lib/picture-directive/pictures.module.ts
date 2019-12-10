import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PicturesThemeDirective } from './pictures.directive';


@NgModule({
  declarations: [PicturesThemeDirective],
  imports: [
    CommonModule
  ],
  exports: [PicturesThemeDirective]
})
export class PicturesThemeModule {}
