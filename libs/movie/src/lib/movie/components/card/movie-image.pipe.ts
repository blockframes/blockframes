import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'movieImage',
  pure: true
})
export class MovieImagePipe implements PipeTransform {
  transform(movie: Movie, size: 'poster' | 'banner' | 'avatar' ) {
    switch (size) {
      case 'poster':
        return movie.main.poster;
      case 'banner':
        return movie.main.banner;
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [MovieImagePipe],
  exports: [MovieImagePipe],
})
export class MovieImageModule {}
