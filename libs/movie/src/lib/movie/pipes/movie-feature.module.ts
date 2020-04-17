import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MovieFeaturePipe } from './movie-feature.pipe';

@NgModule({
  declarations: [MovieFeaturePipe],
  imports: [CommonModule],
  exports: [MovieFeaturePipe]
})
export class MovieFeatureModule {}
