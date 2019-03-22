import { StakeholderStore } from './stakeholder.store';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Stakeholder, createStakeholder } from './stakeholder.model';
import { Observable } from 'rxjs';
import { MovieQuery } from '../../movie/+state';
import { tap } from 'rxjs/operators';

export class StakeholderService {
  private collection: AngularFirestoreCollection<Stakeholder>;
  private activeMovieId$: Observable<string>;

  constructor(
    private store: StakeholderStore,
    private firestore: AngularFirestore,
    private movieQuery: MovieQuery,
    ) {
      this.activeMovieId$ = this.movieQuery.selectActiveId().pipe(
        tap(id =>  this.collection = this.firestore.collection(`movies/${id}/stakeholders`))
      );
  }


 fetch() {
   // todo: unsuscribe on destroy
   this.collection.valueChanges()
    .subscribe(stakeholders => this.store.set(stakeholders));
  }

  public async add(movieId: string, stakeholder: Partial<Stakeholder>): Promise<string> {
    const id = this.firestore.createId();
    const sh: Stakeholder = createStakeholder({ ...stakeholder, id });
    const movieDoc = this.collection.doc(movieId);
    const orgDoc = this.firestore.collection('orgs').doc(sh.orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(sh.id);

    this.firestore.firestore.runTransaction(async (tx) => {
      // Update the movie
      const movie = await tx.get(movieDoc.ref);
      const { stakeholderIds } = movie.data();
      const nextStakeholderIds = [...stakeholderIds, sh.id];
      const p1 = tx.update(movieDoc.ref, { stakeholderIds: nextStakeholderIds});

      // Update the org
      const org = await tx.get(orgDoc.ref);
      const { movieIds } = org.data();
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

  public update(id: string, stakeholder: Partial<Stakeholder>) {
    this.collection.doc(id).update(stakeholder);
  }

  public remove(id: string) {
    this.collection.doc(id).delete()
  }
}
