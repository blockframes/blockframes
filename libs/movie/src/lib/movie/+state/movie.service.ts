import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore/collection/collection';
import { AngularFirestoreDocument } from '@angular/fire/firestore/document/document';
import { Organization, OrganizationQuery, OrganizationService } from '@blockframes/organization';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { firestore } from 'firebase';
import objectHash from 'object-hash';
import { switchMap } from 'rxjs/operators';
import { createMovie, Movie, DistributionDeal } from './movie.model';
import { MovieState, MovieStore } from './movie.store';

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
    private organizationService: OrganizationService,
    store: MovieStore
  ) {
    super(store);
  }

  /** Gets every movieIds of the user active organization and sync them. */
  public syncOrgMovies() {
    return this.organizationQuery.selectActive().pipe(
      switchMap(org => this.syncManyDocs(org.movieIds))
    )
  }

  /** Add a partial or a full movie to the database. */
  public async addMovie(original: string, movie?: Movie): Promise<Movie> {
    const id = this.db.createId();

    if (!movie) {
      // create empty movie
      movie = createMovie({ id, main: { title: { original } } });
    } else {
      // we set an id for this new movie
      movie = createMovie({ id, ...movie });
    }

    // Add movie document to the database
    await this.add(cleanModel(movie))

    return movie;
  }

  /** Hook that triggers when a movie is added to the database. */
  async onCreate(movie: Movie, write: WriteOptions) {
    const organizationId = this.organizationQuery.getActiveId();
    const organization = await this.organizationService.getValue(organizationId);
    return this.db.doc<Organization>(`orgs/${organizationId}`).update({movieIds: [...organization.movieIds, movie.id]})
  }

  public updateById(id: string, movie: any): Promise<void> {
    // we don't want to keep orgId in our Movie object
    if (movie.organization) delete movie.organization;
    if (movie.stakeholders) delete movie.stakeholders;

    return this.update(id, cleanModel(movie));
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
  private distributionDealsCollection(movieId: string): AngularFirestoreCollection<DistributionDeal> {
    return this.movieDoc(movieId).collection('distributiondeals');
  }

  /**
   *
   * @param movieId
   * @param distributionDeal
   */
  public addDistributionDeal(movieId: string, distributionDeal: DistributionDeal): Promise<void> {
    // Create an id from DistributionDeal content.
    // A same DistributionDeal document will always have the same hash to prevent multiple insertion of same deal
    const dealId = objectHash(distributionDeal);
    return this.distributionDealsCollection(movieId).doc(dealId).set(distributionDeal);
  }

  /**
   * Checks if a distribution deal is already existing for a given movie and returns it.
   * @param movieId
   * @param distributionDeal
   */
  public async existingDistributionDeal(movieId: string, distributionDeal: DistributionDeal): Promise<DistributionDeal> {
    const dealId = objectHash(distributionDeal);
    const distributionDealSnapshot = await this.distributionDealsCollection(movieId).doc(dealId).get().toPromise();
    return distributionDealSnapshot.exists ? distributionDealSnapshot.data() as DistributionDeal : undefined;
  }

  /**
   * @param movieId
   */
  public async getDistributionDeals(movieId: string): Promise<DistributionDeal[]> {
    const deals = await this.distributionDealsCollection(movieId).get().toPromise();
    return deals.docs.map(doc => {
      const data = doc.data();
      // Dates from firebase are Timestamps, we convert it to Dates.
      if(data.rights.from instanceof firestore.Timestamp) {
        data.rights.from = data.rights.from.toDate();
      }

      if(data.rights.to instanceof firestore.Timestamp) {
        data.rights.to = data.rights.to.toDate();
      }
      return data as DistributionDeal;
    })
  }
}
