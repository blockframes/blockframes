import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { ImgRef } from '@blockframes/utils/media';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'movieImage',
  pure: true
})
export class MovieImagePipe implements PipeTransform {
  transform(movie: Movie, size: 'poster' | 'banner' | 'avatar' ): ImgRef {
    switch (size) {
      case 'poster':
        return movie.promotionalElements.poster[0]?.media;
      case 'banner':
        return movie.promotionalElements.banner?.media;
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [MovieImagePipe],
  exports: [MovieImagePipe],
})
export class MovieImageModule {}
