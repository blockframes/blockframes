import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { createStakeholder, StakeholderService } from '../../stakeholder/+state';
import { Movie, createMovie } from './movie.model';

@Injectable({ providedIn: 'root' })

export class MovieService {
  private collection: AngularFirestoreCollection<Movie>;

  constructor(
  private firestore: AngularFirestore,
  private shService: StakeholderService,
  ) {
    this.collection = this.firestore.collection<Movie>('movies');
  }

  public async add(original: string, orgId: string, firstAdd: boolean = false ): Promise<Movie> {
    const id = this.firestore.createId();
    const owner = createStakeholder({orgId, orgMovieRole: 'ADMIN', isAccepted: true});
    const movie: Movie = createMovie({ id, title: { original }});

    // TODO: correct race condition
    await this.collection.doc<Movie>(id).set(movie);
    await this.shService.add(id, owner, firstAdd);

    return movie;
  }

  public update(id: string, movie: any) {
    // we don't want to keep orgId in our Movie object
    if (movie.org) delete movie.org;
    if (movie.stakeholders) delete movie.stakeholders;

    this.collection.doc(id).update(movie);
  }

  public remove(id: string) {
    this.collection.doc(id).delete();
  }

}
