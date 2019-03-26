import { Injectable } from '@angular/core';
import { StakeholderStore } from './stakeholder.store';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Stakeholder, createStakeholder } from './stakeholder.model';
import { Observable } from 'rxjs';
//import { MovieQuery } from '../../movie/+state';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })

export class StakeholderService {
  private collection: AngularFirestoreCollection<Stakeholder>;
  private activeMovieId$: Observable<string>;

  constructor(
    private store: StakeholderStore,
    private firestore: AngularFirestore,
    //private movieQuery: MovieQuery,
    ) {
      /*
      this.activeMovieId$ = this.movieQuery.selectActiveId().pipe(
        tap(id =>  this.collection = this.firestore.collection(`movies/${id}/stakeholders`))
      );
      */
  }


 fetch() {
   // todo: unsuscribe on destroy
   this.collection.valueChanges()
    .subscribe(stakeholders => this.store.set(stakeholders));
  }

  public async add(movieId: string, stakeholder: Partial<Stakeholder>): Promise<string> {

    const id = this.firestore.createId();
    const sh: Stakeholder = createStakeholder({ ...stakeholder, id });
    const movieDoc = this.firestore.collection('movies').doc(movieId);
    const orgDoc = this.firestore.collection('orgs').doc(sh.orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(sh.id);

    this.firestore.firestore.runTransaction(async (tx) => {
      const org = await tx.get(orgDoc.ref);
      const movie = await tx.get(movieDoc.ref);

      // Set the stakeholder
      const p3 = tx.set(stakeholderDoc.ref, {sh});

      // Update the movie

      const stakeholderIds = movie.data().stakeholderIds;
      const nextStakeholderIds = [...stakeholderIds, sh.id];
      console.log(nextStakeholderIds);
      const p1 = tx.update(movieDoc.ref, { stakeholderIds: nextStakeholderIds});

      // Update the org

      const movieIds = org.data().movieIds;
      console.log(movieIds);
      const nextMovieIds = [...movieIds, movieId];
      console.log(nextMovieIds);
      const p2 = tx.update(orgDoc.ref, { movieIds: nextMovieIds });




      return Promise.all([p1, p2, p3]);
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.log('Transaction failed: ', error);
    });

    return sh.id;
  }

  public update(id: string, stakeholder: Partial<Stakeholder>) {
    this.collection.doc(id).update(stakeholder);
  }

  public remove(id: string) {
    this.collection.doc(id).delete()
  }
}
