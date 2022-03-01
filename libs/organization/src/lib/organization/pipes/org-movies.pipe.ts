import { Pipe, PipeTransform, NgModule, Inject } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { QueryFn } from '@angular/fire/firestore';
import { APP } from '@blockframes/utils/routes/utils';
import { App } from '@blockframes/utils/apps';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(@Inject(APP) private app: App, private movieService: MovieService) { }

  transform(orgId: string, limit?: number) {
    const query: QueryFn = ref => ref
      .where(`app.${this.app}.access`, '==', true)
      .where(`app.${this.app}.status`, '==', 'accepted')
      .where('orgIds', 'array-contains', orgId);
    if (limit) {
      return this.movieService.valueChanges(ref => query(ref).limit(limit));
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
