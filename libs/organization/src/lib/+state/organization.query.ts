import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { OrganizationState, OrganizationStore } from './organization.store';
import { Organization, OrganizationWithMovies } from './organization.model';
import { map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';

@Injectable({
  providedIn: 'root'
})
export class OrganizationQuery extends QueryEntity<OrganizationState, Organization> {

  public orgsWithMovies$: Observable<OrganizationWithMovies[]> = this.selectAll().pipe(
    switchMap(orgs => {
      const orgsWithMovies$ = orgs.map(org => {
        return this.movieQuery.selectMany(org.movieIds).pipe(
          map(movies => movies.filter(movie => !!movie)),
          map(movies => ({ ...org, movies }))
        )
      })
      return combineLatest(orgsWithMovies$)
    }),
  );

  constructor(private movieQuery: MovieQuery, protected store: OrganizationStore) {
    super(store);
  }

  public get hasOrgs$() {
    return this.selectCount().pipe(map(count => count > 0));
  }

  public getOrgId(name: string) {
    return this.getAll().find(org => org.name === name).id;
  }

  get form$() {
    return this.select(state => state.form);
  }

}
