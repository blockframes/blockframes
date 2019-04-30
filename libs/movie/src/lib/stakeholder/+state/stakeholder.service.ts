import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { createStakeholder, Stakeholder } from './stakeholder.model';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { StakeholderStore } from './stakeholder.store';
import { MovieQuery } from '../../movie/+state/movie.query';
import { Organization } from '@blockframes/organization';
import { FireQuery, Query } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })

export class StakeholderService {

  public stakeholdersByMovie$ = this.movieQuery.selectActive().pipe(
    // TODO: use FireQuery:
    switchMap(movie => this.firestore.collection<Stakeholder>(`movies/${movie.id}/stakeholders`).valueChanges()),
    switchMap(stakeholders => this.getAllStakeholdersWithOrg(stakeholders))
  );

  constructor(
    private firestore: AngularFirestore,
    private store: StakeholderStore,
    private movieQuery: MovieQuery,
    private fireQuery: FireQuery
  ) {
  }

  public get stakeholdersByActiveMovie$() {
    return this.movieQuery.selectActive().pipe(
      filter(movie => !!movie),
      // TODO: use FireQuery:
      switchMap(movie => this.firestore.collection<Stakeholder>(`movies/${movie.id}/stakeholders`).valueChanges()),
      switchMap(stakeholders => this.getAllStakeholdersWithOrg(stakeholders)),
      tap(stakeholders => this.store.set(stakeholders))
    );
  }

  public get activeMovieStakeholders() {
    return this.movieQuery
      .selectActiveId()
      .pipe(
        switchMap(id => this.fireQuery.fromQuery(this.getStakeholderList(id))),
        tap((stakeholders: any) => this.store.set(stakeholders))
      );
  }

  public getAllStakeholdersWithOrg(stakeholders: Stakeholder[]) {
    const shWithOrgs = (sh: Stakeholder) => {
      // TODO: use FireQuery:
      return this.firestore.doc<Organization>(`orgs/${sh.orgId}`)
        .valueChanges()
        .pipe(
          map(organization => ({ ...sh, organization } as Stakeholder))
        );
    };
    const allShWithOrgs = stakeholders.map(sh => shWithOrgs(sh));
    return combineLatest(allShWithOrgs);
  }

  public async add(movieId: string, stakeholder: Partial<Stakeholder>): Promise<string> {
    const id = this.firestore.createId();
    const sh = createStakeholder({ ...stakeholder, id });
    const movieDoc = this.firestore.collection('movies').doc(movieId);
    const orgDoc = this.firestore.collection('orgs').doc(sh.orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(sh.id);

    this.firestore.firestore.runTransaction(async (tx) => {
      const org = await tx.get(orgDoc.ref);

      // Update the org
      const movieIds = org.data().movieIds || [];

      // DEMO: Prevent double add
      // TODO: allow to add the org multiple time with different orgs.
      // BEWARE: update the delete method accordingly when you do.
      if (movieIds.indexOf(movieId) >= 0) {
        return tx.update(orgDoc.ref, {}); // every document read in a transaction must be written.
      }

      const nextMovieIds = [...movieIds, movieId];
      const p1 = tx.update(orgDoc.ref, { movieIds: nextMovieIds });

      // Set the stakeholder
      const p2 = tx.set(stakeholderDoc.ref, sh);

      return Promise.all([p1, p2]);
    })
      .then(() => console.log('Transaction successfully committed!'))
      .catch((error) => console.log('Transaction failed: ', error));

    // TODO: make this function truly async and wait for the tx to complete before returning the id.
    // you might end up listening over an id that does not exists.
    return sh.id;
  }

  public update(movieId: string, stakeholder: Partial<Stakeholder>) {
    // TODO: use FireQuery:
    this.firestore.doc<Stakeholder>(`movies/${movieId}/stakeholders/${stakeholder.id}`).update(stakeholder);
  }

  public async remove(movieId: string, stakeholderId: string) {
    // TODO: use FireQuery:
    const stkPath = `movies/${movieId}/stakeholders/${stakeholderId}`;
    const stkDoc = this.firestore.doc(stkPath);


    return this.firestore.firestore.runTransaction(async (tx) => {

      // Delete the stakeholder:
      const stk = await tx.get(stkDoc.ref);
      const { orgId } = stk.data() as Stakeholder;

      // Remove the movie from the org's movie list:
      // BEWARE: we'll have to check whether the org is still a stakeholder
      //         when we'll allow an org to have multiple stakeholder roles.
      const orgPath = `orgs/${orgId}`;
      const orgDoc = this.firestore.doc(orgPath);
      const org = await tx.get(orgDoc.ref);
      const { movieIds } = org.data() as Organization;

      const newMovieIds = movieIds.filter(x => x !== movieId);

      return Promise.all([
        tx.delete(stkDoc.ref),
        tx.update(orgDoc.ref, { movieIds: newMovieIds })
      ]);
    });
  }

  public subscribeOnStakeholdersByActiveMovie$() {
    return this.movieQuery.selectActive().pipe(
      // TODO: use FireQuery:
      switchMap(movie => this.firestore.collection<Stakeholder>(`movies/${movie.id}/stakeholders`).valueChanges()),
      switchMap(stakeholders => this.getAllStakeholdersWithOrg(stakeholders)),
      tap(stakeholders => this.store.set(stakeholders))
    );
  }

  private getStakeholderList(movieId: string): Query<Stakeholder> {
    return {
      path: `movies/${movieId}/stakeholders`,
      organization: (stakeholder: Stakeholder): Query<Organization> => ({
        path: `orgs/${stakeholder.orgId}`
      })
    };
  }
}
