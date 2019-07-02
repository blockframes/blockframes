import { Injectable } from '@angular/core';
import { createMovieStakeholder, StakeholderService } from '../../stakeholder/+state';
import { Movie, createMovie } from './movie.model';
import { FireQuery } from '@blockframes/utils';
import { RightsService, OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore } from './movie.store';

@Injectable({ providedIn: 'root' })

export class MovieService {

  constructor(
  private db: FireQuery,
  private shService: StakeholderService,
  private orgQuery: OrganizationQuery,
  private rightsService: RightsService,
  private store: MovieStore,
  ) {}

  public async add(original: string, firstAdd: boolean = false ): Promise<Movie> {
    const id = this.db.createId();
    const orgId = this.orgQuery.getValue().org.id
    const owner = createMovieStakeholder({orgId, isAccepted: true});
    const movie: Movie = createMovie({ id, title: { original }});

    // TODO: correct race condition
    await this.rightsService.createDocAndRights<Movie>(movie, orgId);

    await this.shService.add(id, owner, firstAdd);

    return movie;
  }

  public update(id: string, movie: any) {
    // we don't want to keep orgId in our Movie object
    if (movie.org) delete movie.org;
    if (movie.stakeholders) delete movie.stakeholders;

    this.db.doc<Movie>(`movies/${id}`).update(movie);
  }

  public remove(movieId: string) {
    const org = this.orgQuery.getValue().org;
    const movieIds = org.movieIds.filter(id => id !== movieId);

    return this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const orgDoc = this.db.doc<Organization>(`orgs/${org.id}`);
      const movieDoc = this.db.doc<Movie>(`movies/${movieId}`);
      const promises = [
        // Delete the movie in movies collection
        tx.delete(movieDoc.ref),
        // Delete the movie id in org.movieIds
        tx.update(orgDoc.ref, { movieIds })
      ];
      // Remove the movie from the movies store
      this.store.remove(movieId);
      return Promise.all(promises);
    });
  }

}
