import { Injectable } from '@angular/core';
import { Movie, createMovie, MovieSale } from './movie.model';
import { PermissionsService, OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore, MovieState } from './movie.store';
import { CollectionService, CollectionConfig } from 'akita-ng-fire';
import { switchMap } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore/document/document';
import { AngularFirestoreCollection } from '@angular/fire/firestore/collection/collection';
import objectHash from 'object-hash';

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

// TODO#944 - refactor CRUD operations
@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {
  constructor(
    private organizationQuery: OrganizationQuery,
    private permissionsService: PermissionsService,
    store: MovieStore
  ) {
    super(store);
  }

  /** Gets every movieIds of the user active organization and sync them. */
  public syncOrgMovies() {
    return this.organizationQuery.select('org').pipe(
      switchMap(org => this.syncManyDocs(org.movieIds))
    )
  }

  public async addMovie(original: string, movie?: Movie): Promise<Movie> {
    const id = this.db.createId();
    const organization = this.organizationQuery.getValue().org;
    const organizationDoc = this.db.doc<Organization>(`orgs/${organization.id}`);

    if (!movie) {
      // create empty movie
      movie = createMovie({ id, main: { title: { original } } });
    } else {
      // we set an id for this new movie
      movie = createMovie({ id, ...movie });
    }

    await this.db.firestore.runTransaction(async (tx: firebase.firestore.Transaction) => {
      const organizationSnap = await tx.get(organizationDoc.ref);
      const movieIds = organizationSnap.data().movieIds || [];

      // Create movie document and permissions
      await this.permissionsService.createDocAndPermissions<Movie>(
        cleanModel(movie),
        organization,
        tx
      );

      // Update the org movieIds
      const nextMovieIds = [...movieIds, movie.id];
      tx.update(organizationDoc.ref, { movieIds: nextMovieIds });
    });
    return movie;
  }

  public updateById(id: string, movie: any): Promise<void> {
    // we don't want to keep orgId in our Movie object
    if (movie.organization) delete movie.organization;
    if (movie.stakeholders) delete movie.stakeholders;

    return this.db.doc<Movie>(`movies/${id}`).update(cleanModel(movie));
  }

  private movieDoc(movieId: string): AngularFirestoreDocument<Movie> {
    return this.db.doc(`movies/${movieId}`);
  }

  /////////////////////////////
  // CRUD DISTRIBUTION DEALS //
  /////////////////////////////

  /**
   * 
   * @param movieId 
   */
  private distributionDealsCollection(movieId: string): AngularFirestoreCollection<MovieSale> {
    return this.movieDoc(movieId).collection('distributiondeals');
  }

  /**
   * 
   * @param movieId 
   * @param distributionDeal 
   */
  public addDistributionDeal(movieId: string, distributionDeal: MovieSale): Promise<void> {
    // Create an id from MovieSale content.
    // A same MovieSale document will always have the same hash to prevent multiple insertion of same deal
    const dealId = objectHash(distributionDeal); 
    return this.distributionDealsCollection(movieId).doc(dealId).set(distributionDeal);
  }

  /**
   * Checks if a distribution deal is already existing for a given movie and returns it.
   * @param movieId 
   * @param distributionDeal 
   */
  public async existingDistributionDeal(movieId: string, distributionDeal: MovieSale): Promise<MovieSale> {
    const dealId = objectHash(distributionDeal); 
    const distributionDealSnapshot = await this.distributionDealsCollection(movieId).doc(dealId).get().toPromise();
    return distributionDealSnapshot.exists ? distributionDealSnapshot.data() as MovieSale : undefined;
  }
}
