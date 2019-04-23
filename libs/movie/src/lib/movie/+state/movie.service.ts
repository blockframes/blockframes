import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { createStakeholder, StakeholderService, Stakeholder, StakeholderStore } from '../../stakeholder/+state';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore } from './movie.store';
import { Movie, createMovie } from './movie.model';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { MovieQuery } from './movie.query';
import { FireQuery, Query } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })

export class MovieService {
  private collection: AngularFirestoreCollection<Movie>;

  constructor(
  private store: MovieStore,
  private shStore: StakeholderStore,
  private firestore: AngularFirestore,
  private orgQuery: OrganizationQuery,
  private query: MovieQuery,
  private shService: StakeholderService,
  private fireQuery: FireQuery,
  ) {
    this.collection = this.firestore.collection<Movie>('movies');
  }

  public async add(original: string, orgId: string): Promise<Movie> {
    const id = this.firestore.createId();
    const owner = createStakeholder({orgId, orgMovieRole: 'ADMIN'});
    const movie: Movie = createMovie({ id, title: { original }});

    // TODO: correct race condition
    await this.collection.doc<Movie>(id).set(movie);
    await this.shService.add(id, owner);

    return movie;
  }

  public update(id: string, movie: any) {
    // we don't want to keep orgId in our Movie object
    if (movie.org) delete movie.org;
    if (movie.stakeholders) delete movie.stakeholders;

    this.collection.doc(id).update(movie);
  }

  public remove(id: string) {
    this.collection.doc(id).delete();
  }

  public get moviesOfOrganizations$(): Observable<Movie[]>{
    return this.orgQuery.selectAll().pipe(
      map(orgs => orgs.reduce((movieIds, org) => [...(org.movieIds || []), ...movieIds], [])),
      switchMap((movieIds: string[]) => {
        const movies$ = movieIds.map(id => this.firestore.doc<Movie>(`movies/${id}`).valueChanges())
        return combineLatest(movies$)
      }),
      tap((movies: Movie[]) => this.store.set(movies))
    );
  }

  public get activeMovieStakeholders() {
    return this.query
      .selectActiveId()
      .pipe(
        switchMap(id => this.fireQuery.fromQuery(this.getStakeholderList(id))),
        tap((stakeholders: any) => this.shStore.set(stakeholders))
      );
  }

  private getStakeholderList(movieId: string): Query<Stakeholder> {
    return {
      path: `movies/${movieId}/stakeholders`,
      organization: (stakeholder: Stakeholder): Query<Organization> => ({
        path: `orgs/${stakeholder.orgId}`
      })
    }
  }
}
