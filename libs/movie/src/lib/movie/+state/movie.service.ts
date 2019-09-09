import { Injectable } from '@angular/core';
import { StakeholderService } from '../../stakeholder/+state';
import { Movie, createMovie } from './movie.model';
import { FireQuery } from '@blockframes/utils';
import { PermissionsService, OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore } from './movie.store';

/**
 * @see #483
 * This method is used before pushing data on db
 * to prevent "Unsupported field value: undefined" errors.
 * Doing JSON.parse(JSON.stringify(data)) clones object and
 * removes undefined fields and empty arrays.
 * This methods also removes readonly settings on objects coming from Akita
 */
export function cleanModel<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

@Injectable({ providedIn: 'root' })

export class MovieService {

  constructor(
  private db: FireQuery,
  private shService: StakeholderService,
  private organizationQuery: OrganizationQuery,
  private permissionsService: PermissionsService,
  private store: MovieStore
  ) {}

  public async addMovie(original: string, movie?: Movie): Promise<Movie> {
    const id = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const organizationDoc = this.db.doc<Organization>(`orgs/${organization.id}`);

    if(!movie) { // create empty movie
      movie = createMovie({ id, main: {title: { original }}});
    } else { // we set an id for this new movie
      movie = createMovie({ id, ...movie });
    }

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const organizationSnap = await tx.get(organizationDoc.ref);
      const movieIds = organizationSnap.data().movieIds || [];

      // Create movie document and permissions
      await this.permissionsService.createDocAndPermissions<Movie>(cleanModel(movie), organization, tx);

      // Update the org movieIds
      const nextMovieIds = [...movieIds, movie.id];
      tx.update(organizationDoc.ref, { movieIds: nextMovieIds })

    });
    return movie;
  }

  public update(id: string, movie: any) : Promise<void>{
    // we don't want to keep orgId in our Movie object
    if (movie.organization) delete movie.organization;
    if (movie.stakeholders) delete movie.stakeholders;

    return this.db.doc<Movie>(`movies/${id}`).update(cleanModel(movie));
  }

  public async remove(movieId: string): Promise<void> {
    const movieDoc = this.db.doc<Movie>(`movies/${movieId}`);

    await this.db.firestore.runTransaction(async(tx: firebase.firestore.Transaction) => {
      // Delete the movie in movies collection
      tx.delete(movieDoc.ref);
      // Remove the movie from the movies store
      this.store.remove(movieId);
    })
  }

}
