import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetsThemeDirective } from './assets-theme.directive';


@NgModule({
  declarations: [AssetsThemeDirective],
  imports: [
    CommonModule
  ],
  exports: [AssetsThemeDirective]
})
export class AssetsThemeModule {}
