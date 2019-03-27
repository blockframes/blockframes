import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Stakeholder, createStakeholder } from './stakeholder.model';


@Injectable({ providedIn: 'root' })

export class StakeholderService {

  constructor(
    private firestore: AngularFirestore,
    ) {}


  public async add(movieId: string, stakeholder: Partial<Stakeholder>): Promise<string> {

    const id = this.firestore.createId();
    const sh: Stakeholder = createStakeholder({ ...stakeholder, id });
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
      const p3 = tx.set(stakeholderDoc.ref, {sh});

      return Promise.all([p1, p2, p3]);
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.log('Transaction failed: ', error);
    });

    return sh.id;
  }

}
