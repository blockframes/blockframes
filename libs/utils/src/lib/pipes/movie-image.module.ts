import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MovieImagePipe } from './movie-image.pipe';

@NgModule({
  declarations: [MovieImagePipe],
  imports: [CommonModule],
  exports: [MovieImagePipe]
})
export class MovieImageModule {}
