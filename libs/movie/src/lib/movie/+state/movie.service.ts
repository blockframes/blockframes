import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { createStakeholder, StakeholderService } from '../../stakeholder/+state';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore } from './movie.store';
import { Movie, createMovie } from './movie.model';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, tap, map, distinctUntilChanged } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })

export class MovieService {
  private collection: AngularFirestoreCollection<Movie>;

  constructor(
  private store: MovieStore,
  private firestore: AngularFirestore,
  private orgQuery: OrganizationQuery,
  private shService: StakeholderService,
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
    // TODO: make a firebase function
    this.collection.doc(id).delete();
  }

  public moviesByOrganisation$(org: Organization): Observable<Movie[]> {
    const moviesByOrg$: Observable<Movie>[] =
      org.movieIds.map(movieId => {
        return this.firestore.doc<Movie>(`movies/${movieId}`)
          .valueChanges()
          .pipe(
            map(movie => ({ ...movie, organization: org}))
          );
      });
    return combineLatest(moviesByOrg$);
  }

  public get moviesOfOrganizations$(): Observable<Movie[]>{
    return this.orgQuery.selectAll().pipe(
      switchMap((orgs: Organization[]) => {
        const movies$ = orgs.map(org => this.moviesByOrganisation$(org))
        return combineLatest(movies$)
      }),
      map((moviesPerOrgs: Movie[][]) => [].concat.apply([], moviesPerOrgs) as Movie[]),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap((movies: Movie[]) => this.store.set(movies))
    );
  }
}

