import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Organization } from '../+state';
import { MovieService } from '@blockframes/movie/+state';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(private movieService: MovieService) {}

  transform(org: Organization, from: number = 0, to: number = org.movieIds.length) {
    const movieIds = Object.assign([], org.movieIds).splice(from, to);
    return this.movieService.valueChanges(movieIds);
  }
}

@NgModule({
  declarations: [OrgMoviesPipe],
  exports: [OrgMoviesPipe]
})
export class OrgMoviesModule {}
