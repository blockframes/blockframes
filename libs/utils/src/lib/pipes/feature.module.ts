import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FeaturePipe } from './feature.pipe';

@NgModule({
  declarations: [FeaturePipe],
  imports: [CommonModule],
  exports: [FeaturePipe]
})
export class FeatureModule {}
