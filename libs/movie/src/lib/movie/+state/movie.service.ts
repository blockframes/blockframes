import { Injectable } from '@angular/core';
import { Movie, createMovie, MovieSale } from './movie.model';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import { MovieStore, MovieState } from './movie.store';
import { CollectionService, CollectionConfig, WriteOptions } from 'akita-ng-fire';
import { switchMap } from 'rxjs/operators';
import { AngularFirestoreDocument } from '@angular/fire/firestore/document/document';
import { AngularFirestoreCollection } from '@angular/fire/firestore/collection/collection';
import objectHash from 'object-hash';
import { firestore } from 'firebase';

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

  /** Add a partial or a full movie to the database. */
  public addMovie(original: string, movie?: Movie): Movie {
    const id = this.db.createId();

    if (!movie) {
      // create empty movie
      movie = createMovie({ id, main: { title: { original } } });
    } else {
      // we set an id for this new movie
      movie = createMovie({ id, ...movie });
    }

    // Add movie document to the database
    this.add(cleanModel(movie))

    return movie;
  }

  /** Hook that triggers when a movie is added to the database. */
  onCreate(movie: Movie, write: WriteOptions) {
    const organization = this.organizationQuery.getValue().org;
    return this.db.doc<Organization>(`orgs/${organization.id}`).update({movieIds: [...organization.movieIds, movie.id]})
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

  /**
   * @param movieId
   */
  public async getDistributionDeals(movieId: string): Promise<MovieSale[]> {
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
      return data as MovieSale;
    })
  }
}
