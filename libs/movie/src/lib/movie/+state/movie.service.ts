import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { MovieStore } from './movie.store';
import { Movie, createMovie } from './movie.model';
import { takeWhile } from 'rxjs/operators';
import { Stakeholder, createStakeholder } from '../../stakeholder/+state/stakeholder.model';
import { OrganizationQuery } from '@blockframes/organization';
import { StakeholderService } from '@blockframes/movie';


@Injectable({ providedIn: 'root' })
export class MovieService {
  private collection: AngularFirestoreCollection<Movie>;
  public initiated = false;

  constructor(
  private store: MovieStore,
  private firestore: AngularFirestore,
  private orgQuery: OrganizationQuery,
  private shService: StakeholderService,
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

  public async add(title: string): Promise<string> {
    const orgId = this.orgQuery.getActiveId();
    const id = this.firestore.createId();
    const owner: Stakeholder = createStakeholder({orgId, role: 'ADMIN'});

    this.collection.doc(id).set((createMovie({ id, title: [title] })));
    await this.shService.add(id, owner);
    return id;
  }

  public update(id: string, movie: Partial<Movie>) {
    this.collection.doc(id).update(movie);
  }

  public remove(id: string) {
    this.collection.doc(id).delete()
  }

}
