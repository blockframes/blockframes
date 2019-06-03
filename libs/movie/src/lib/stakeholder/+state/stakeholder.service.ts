import { Injectable } from '@angular/core';
import { createMovieStakeholder, Stakeholder } from './stakeholder.model';
import { Organization } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })

export class StakeholderService {

  constructor(private db: FireQuery,) {}

  public async add(movieId: string, stakeholder: Partial<Stakeholder>, firstAdd: boolean = false ): Promise<string> {
    const id = this.db.createId();
    const sh = createMovieStakeholder({ ...stakeholder, id });
    const movieDoc = this.db.collection('movies').doc(movieId);
    const orgDoc = this.db.collection('orgs').doc(sh.orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(sh.id);

    await this.db.firestore.runTransaction(async (tx) => {
      const promises = [];

      // it true, add directly movie into org and bypasses notification approval
      // required when a movie is created
      if( firstAdd ) {
        const org = await tx.get(orgDoc.ref);

        // Update the org
        const movieIds = org.data().movieIds || [];

        // DEMO: Prevent double add
        // TODO: allow to add the org multiple time with different orgs.
        // BEWARE: update the delete method accordingly when you do.
        if (movieIds.includes(movieId)) {
          return tx.update(orgDoc.ref, {}); // every document read in a transaction must be written.
        }

        const nextMovieIds = [...movieIds, movieId];
        promises.push(tx.update(orgDoc.ref, { movieIds: nextMovieIds }));
      }

      // Set the stakeholder
      promises.push(tx.set(stakeholderDoc.ref, sh));

      return Promise.all(promises);
    });
    console.log('Transaction successfully committed!');

    return sh.id;
  }

  public update(movieId: string, stakeholder: Partial<Stakeholder>) {
    // TODO: use FireQuery:
    this.db.doc<Stakeholder>(`movies/${movieId}/stakeholders/${stakeholder.id}`).update(stakeholder);
  }

  public async remove(movieId: string, stakeholderId: string) {
    // TODO: use FireQuery:
    const stkPath = `movies/${movieId}/stakeholders/${stakeholderId}`;
    const stkDoc = this.db.doc(stkPath);


    return this.db.firestore.runTransaction(async (tx) => {

      // Delete the stakeholder:
      const stk = await tx.get(stkDoc.ref);
      const { orgId } = stk.data() as Stakeholder;

      // Remove the movie from the org's movie list:
      // BEWARE: we'll have to check whether the org is still a stakeholder
      //         when we'll allow an org to have multiple stakeholder roles.
      const orgPath = `orgs/${orgId}`;
      const orgDoc = this.db.doc(orgPath);
      const org = await tx.get(orgDoc.ref);
      const { movieIds } = org.data() as Organization;

      const newMovieIds = movieIds.filter(x => x !== movieId);

      return Promise.all([
        tx.delete(stkDoc.ref),
        tx.update(orgDoc.ref, { movieIds: newMovieIds })
      ]);
    });
  }

}
