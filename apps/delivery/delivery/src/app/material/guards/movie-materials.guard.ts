import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { StateListGuard, FireQuery, Query } from '@blockframes/utils';
import { MaterialStore, Material } from '../+state';
import { switchMap } from 'rxjs/operators';
import { MovieQuery } from '@blockframes/movie';

const movieMaterialsQuery = (movieId: string): Query<Material[]> => ({
  path: `movies/${movieId}/materials`
});

@Injectable({ providedIn: 'root' })
export class MovieMaterialsGuard extends StateListGuard<Material> {
  urlFallback = 'layout';

  constructor(
    private fireQuery: FireQuery,
    private movieQuery: MovieQuery,
    store: MaterialStore,
    router: Router
  ) {
    super(store, router);
  }

  get query() {
    return this.movieQuery.selectActiveId().pipe(
      switchMap(movieId => {
        const query = movieMaterialsQuery(movieId);
        return this.fireQuery.fromQuery<Material[]>(query);
      })
    );
  }
}
