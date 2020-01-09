import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundAssetDirective } from './background-asset.directive';


@NgModule({
  declarations: [BackgroundAssetDirective],
  imports: [CommonModule],
  exports: [BackgroundAssetDirective]
})
export class BackgroundAssetModule {}
