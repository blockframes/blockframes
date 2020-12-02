import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { QueryFn } from '@angular/fire/firestore';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(private routerQuery: RouterQuery, private movieService: MovieService) { }

  transform(orgId: string, limit?: number) {
    const appName = getCurrentApp(this.routerQuery);
    const query: QueryFn = ref => ref
      .where(`storeConfig.appAccess.${appName}`, '==', true)
      .where(`storeConfig.status`, '==', 'accepted')
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
