import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetDirective } from './img-asset.directive';


@NgModule({
  declarations: [AssetDirective],
  imports: [CommonModule],
  exports: [AssetDirective]
})
export class ImgAssetModule {}
