import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { HostedMedia } from '@blockframes/media/+state/media.firestore';
import { CommonModule } from '@angular/common';

@Pipe({
  name: 'movieImage',
  pure: true
})
export class MovieImagePipe implements PipeTransform {
  transform(movie: Movie, size: 'poster' | 'banner' | 'avatar' ): HostedMedia {
    switch (size) {
      case 'poster':
        return movie.poster?.media;
      case 'banner':
        return movie.banner?.media;
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [MovieImagePipe],
  exports: [MovieImagePipe],
})
export class MovieImageModule {}
