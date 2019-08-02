import { Injectable } from '@angular/core';
import { StakeholderService } from '../../stakeholder/+state';
import { Movie, createMovie } from './movie.model';
import { FireQuery } from '@blockframes/utils';
import { PermissionsService, OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore } from './movie.store';

@Injectable({ providedIn: 'root' })

export class MovieService {

  constructor(
  private db: FireQuery,
  private shService: StakeholderService,
  private organizationQuery: OrganizationQuery,
  private permissionsService: PermissionsService,
  private store: MovieStore,
  private fireQuery: FireQuery
  ) {}

  public async addMovie(original: string): Promise<Movie> {
    const id = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const organizationDoc = this.db.doc<Organization>(`orgs/${organization.id}`);
    const movie: Movie = createMovie({ id, main: {title: { original }}});

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const organizationSnap = await tx.get(organizationDoc.ref);
      const movieIds = organizationSnap.data().movieIds || [];

      // Create movie document and permissions
      await this.permissionsService.createDocAndPermissions<Movie>(movie, organization, tx);

      // Create the first stakeholder in sub-collection
      await this.shService.addStakeholder(movie, organization, true, tx);

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

    return this.db.doc<Movie>(`movies/${id}`).update(movie);
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
