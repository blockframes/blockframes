import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MovieStore } from './movie.store';
import { Movie, createMovie } from './movie.model';
import { takeWhile } from 'rxjs/operators';


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
  fetch() {
    if(this.initiated) return;
    this.initiated = true;
    this.collection.valueChanges().pipe(
      takeWhile(_ => this.initiated)
    ).subscribe(movies => this.store.set(movies));
  }

  public add(movie: Movie) {
    const id = this.firestore.createId();
    this.collection.doc(id).set((createMovie({...movie, id})));
  }

  public update(id: string, movie: Partial<Movie>) {
    this.collection.doc(id).update(movie);
  }

  public remove(id: string) {
    this.collection.doc(id).delete()
  }

}
