import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { QueryFn } from '@angular/fire/firestore';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(private appGuard: AppGuard, private movieService: MovieService) { }

  transform(orgId: string, limit?: number) {
    const appName = this.appGuard.currentApp;
    const query: QueryFn = ref => ref
      .where(`app.${appName}.access`, '==', true)
      .where(`app.${appName}.status`, '==', 'accepted')
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
