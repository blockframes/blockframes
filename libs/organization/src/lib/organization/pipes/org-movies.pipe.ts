import { Pipe, PipeTransform, NgModule, Inject } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/utils/apps';
import { where, limit } from 'firebase/firestore';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(@Inject(APP) private app: App, private movieService: MovieService) { }

  transform(orgId: string, length?: number) {
    const query = [
      where(`app.${this.app}.access`, '==', true),
      where(`app.${this.app}.status`, '==', 'accepted'),
      where('orgIds', 'array-contains', orgId)
    ];
    if (length) {
      query.push(limit(length));
      return this.movieService.valueChanges(query);
    } else {
      return this.movieService.valueChanges(query);
    }
  }
}

@NgModule({
  declarations: [OrgMoviesPipe],
  exports: [OrgMoviesPipe]
})
export class OrgMoviesModule { }
