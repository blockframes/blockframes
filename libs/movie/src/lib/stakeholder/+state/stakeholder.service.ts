import { StakeholderStore } from './stakeholder.store';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Stakeholder, createStakeholder } from './stakeholder.model';
import { Observable } from 'rxjs';
import { Movie, MovieQuery } from '../../movie/+state';
import { switchMap, tap } from 'rxjs/operators';

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
   this.collection.valueChanges().subscribe(stakeholders => this.store.set(stakeholders));
  }

  public add(stakeholder: Stakeholder) {
    const id = this.firestore.createId();
    this.collection.doc(id).set((createStakeholder({...stakeholder, id})));
  }

  public update(id: string, stakeholder: Partial<Stakeholder>) {
    this.collection.doc(id).update(stakeholder);
  }

  public remove(id: string) {
    this.collection.doc(id).delete()
  }
}
