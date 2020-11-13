import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { Organization } from '../+state';
import { fromOrg, MovieService } from '@blockframes/movie/+state';
import { map } from 'rxjs/operators';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(private movieService: MovieService) { }

  transform(org: Organization, from: number = 0, to?: number) {
    return this.movieService.valueChanges(fromOrg(org.id)).pipe(map(movies => {
      return to ? movies.splice(from, to) : movies.splice(from, movies.length)
    }));
  }
}

@NgModule({
  declarations: [OrgMoviesPipe],
  exports: [OrgMoviesPipe]
})
export class OrgMoviesModule { }
