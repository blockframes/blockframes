import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MovieStore } from './movie.store';
import { Movie, createMovie } from './movie.model';
import { takeWhile } from 'rxjs/operators';
import { Stakeholder } from '../../stakeholder/+state/stakeholder.model';


@Injectable({ providedIn: 'root' })
export class MovieService {
  private collection: AngularFirestoreCollection<Movie>;
  public initiated = false;

  constructor(
  private store: MovieStore,
  private firestore: AngularFirestore,
  ) {
    this.collection = this.firestore.collection('movies');
  }

  /*
  Initiate Movies
  this.initiated turns false when user logout
  */
  public fetch() {
    if(this.initiated) return;
    this.initiated = true;
    this.collection.valueChanges().pipe(
      takeWhile(_ => this.initiated)
    ).subscribe(movies => this.store.set(movies));
  }

  public subscribeOrgMovies(orgId): void {
    if(this.initiated) return;
    this.initiated = true;
    this.firestore
     .collection<Movie>('movies', ref => ref.where('stakeholderIds', 'array-contains', orgId))
     .valueChanges().pipe(
      takeWhile(_ => this.initiated)
     ).subscribe(movies => this.store.set(movies));
  }

  public async addStakeholder(movieId: string, stakeholder: Stakeholder): Promise<string> {
    const movieDoc = this.collection.doc(movieId);
    const orgDoc = this.firestore.collection('orgs').doc(stakeholder.orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(stakeholder.id);

    this.firestore.firestore.runTransaction(async (tx) => {
      // Update the movie
      const movie = await tx.get(movieDoc.ref);
      const { stakeholderIds } = movie.data();
      const nextStakeholderIds = [...stakeholderIds, stakeholder.id];
      const p1 = tx.update(movieDoc.ref, { stakeholderIds: nextStakeholderIds});

      // Update the org
      const org = await tx.get(orgDoc.ref);
      const { movieIds } = org.data();
      const nextMovieIds = [...movieIds, movieId];
      const p2 = tx.update(orgDoc.ref, { movieIds: nextMovieIds });

      // Set the stakeholder
      const p3 = tx.set(stakeholderDoc.ref, {...stakeholder});

      return Promise.all([p1, p2, p3]);
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.log('Transaction failed: ', error);
    });

    return stakeholder.id;
  }

  public async add(title: string, orgId: string): Promise<string> {
    const movieId = this.firestore.createId();
    const movie: Movie = createMovie({ id: movieId, title: [title], stakeholderIds: [orgId] });
    const stakeholderId = this.firestore.createId();

    const movieDoc = this.collection.doc(movieId);
    const orgDoc = this.firestore.collection('orgs').doc(orgId);
    const stakeholderDoc = movieDoc.collection('stakeholders').doc(stakeholderId);

    this.firestore.firestore.runTransaction(async (tx) => {
    // Update the org
    const org = await tx.get(orgDoc.ref);
    const { movieIds } = org.data();
    const nextMovieIds = [...movieIds, movieId];

      return Promise.all([
        tx.set(movieDoc.ref, movie),
        tx.update(orgDoc.ref, { movieIds: [...movieIds, nextMovieIds] }),
        // @todo admin string comes from json
        tx.set(stakeholderDoc.ref, {id: stakeholderId, role: 'ADMIN'})
      ]);
    }).then(() => {
      console.log('Transaction successfully committed!');
    }).catch((error) => {
      console.log('Transaction failed: ', error);
    });

    return movieId;

  }

  public update(id: string, movie: Partial<Movie>) {
    this.collection.doc(id).update(movie);
  }

  public remove(id: string) {
    this.collection.doc(id).delete()
  }

}
