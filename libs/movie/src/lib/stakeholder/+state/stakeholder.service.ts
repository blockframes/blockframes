import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Stakeholder, createStakeholder } from './stakeholder.model';
import { Observable, combineLatest, forkJoin } from 'rxjs';
import { map, filter, first } from 'rxjs/operators';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { tap } from 'rxjs/internal/operators/tap';
import { StakeholderStore } from './stakeholder.store';
import { MovieQuery } from '../../movie/+state/movie.query';
import { Organization } from '@blockframes/organization';

@Injectable({ providedIn: 'root' })

export class StakeholderService {

  constructor(
    private firestore: AngularFirestore,
    private store: StakeholderStore,
    private movieQuery: MovieQuery,
  ) {}

  public get stakeholdersByActiveMovie$(){
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      switchMap( ({stakeholderIds}) =>
        combineLatest(...stakeholderIds.map(id =>
          this.getStakeholderFilledWithOrganization(this.movieQuery.getActiveId(), id)
        ))
      ),
      tap(stakeholders => this.store.set(stakeholders))
    );
  }

  public getStakeholderByMovieAndId(movieId: string, id: string): Observable<Stakeholder> {
    const ref = this.firestore.doc<Stakeholder>(`movies/${movieId}/stakeholders/${id}`);
    return ref.valueChanges();
  }

  public getStakeholderOrganizationByMovieAndId(movieId: string, id: string): Observable<Organization>{
    return this.getStakeholderByMovieAndId(movieId, id).pipe(
      switchMap(({orgId}) => this.firestore.collection('orgs').doc<Organization>(orgId).valueChanges())
    );
  }

  public getStakeholderFilledWithOrganization(movieId: string, id: string): Observable<Stakeholder> {
    const stakeholder$ = this.getStakeholderByMovieAndId(movieId, id).pipe(first());
    const organization$ = this.getStakeholderOrganizationByMovieAndId(movieId, id).pipe(first());

    return forkJoin(stakeholder$, organization$).pipe(
      map(([stakeholder, org]): Stakeholder => {
        return ({
          ...stakeholder,
          organization: org,
        })
      })
    );
  }

  public async add(movieId: string, stakeholder: Partial<Stakeholder>): Promise<string> {

    const id = this.firestore.createId();
    const sh = createStakeholder({ ...stakeholder, id });
    const movieDoc = this.firestore.collection('movies').doc(movieId);
    const orgDoc = this.firestore.collection('orgs').doc(sh.orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(sh.id);

    this.firestore.firestore.runTransaction(async (tx) => {
      const org = await tx.get(orgDoc.ref);
      const movie = await tx.get(movieDoc.ref);

      // Update the movie
      const stakeholderIds = movie.data().stakeholderIds;
      const nextStakeholderIds = [...stakeholderIds, sh.id];
      const p1 = tx.update(movieDoc.ref, { stakeholderIds: nextStakeholderIds});

      // Update the org
      const movieIds = org.data().movieIds;
      const nextMovieIds = [...movieIds, movieId];
      const p2 = tx.update(orgDoc.ref, { movieIds: nextMovieIds });

      // Set the stakeholder
      const p3 = tx.set(stakeholderDoc.ref, sh);

      return Promise.all([p1, p2, p3]);
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.log('Transaction failed: ', error);
    });

    return sh.id;
  }

}
