import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetDirective } from './assets-theme.directive';


@NgModule({
  declarations: [AssetDirective],
  imports: [
    CommonModule
  ],
  exports: [AssetDirective]
})
export class AssetsThemeModule {}
