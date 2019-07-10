import { Injectable } from '@angular/core';
import { createMovieStakeholder, Stakeholder } from './stakeholder.model';
import { Organization } from '@blockframes/organization';
import { FireQuery } from '@blockframes/utils';

@Injectable({ providedIn: 'root' })

export class StakeholderService {

  constructor(private db: FireQuery,) {}

  public async addStakeholder(movieId: string, org: Partial<Organization>, isAccepted: boolean = false): Promise<string> {
    const stakeholder = createMovieStakeholder({id: org.id, isAccepted})

    await this.db.firestore.runTransaction(async (tx) => {
      const stakeholderDoc = this.db.doc<Stakeholder>(`movies/${movieId}/stakeholders/${stakeholder.id}`)
      return Promise.all([
        tx.set(stakeholderDoc.ref, stakeholder)
      ]);
    });
    console.log('Transaction successfully committed!');

    return stakeholder.id;
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
      const { id } = stk.data() as Stakeholder;

      // Remove the movie from the org's movie list:
      // BEWARE: we'll have to check whether the org is still a stakeholder
      //         when we'll allow an org to have multiple stakeholder roles.
      const orgPath = `orgs/${id}`;
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
