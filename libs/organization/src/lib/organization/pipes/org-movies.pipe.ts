import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { MovieService } from '@blockframes/movie/+state';
import { QueryFn } from '@angular/fire/firestore';
import { getCurrentApp } from '@blockframes/utils/apps';
import { ActivatedRoute } from '@angular/router';

@Pipe({ name: 'orgMovies', pure: true })
export class OrgMoviesPipe implements PipeTransform {
  constructor(private route: ActivatedRoute, private movieService: MovieService) { }

  transform(orgId: string, limit?: number) {
    const appName = getCurrentApp(this.route);
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
