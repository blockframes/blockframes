import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssetPipe } from './path-asset.pipe';


@NgModule({
  declarations: [AssetPipe],
  imports: [CommonModule],
  exports: [AssetPipe]
})
export class PathAssetModule {}