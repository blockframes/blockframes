import { Injectable } from '@angular/core';
import { AngularFirestoreCollection } from '@angular/fire/firestore/collection/collection';
import { AngularFirestoreDocument } from '@angular/fire/firestore/document/document';
import { OrganizationQuery, OrganizationService, PermissionsService } from '@blockframes/organization';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { firestore } from 'firebase';
import objectHash from 'object-hash';
import { switchMap } from 'rxjs/operators';
import { createMovie, Movie, DistributionDeal } from './movie.model';
import { MovieState, MovieStore } from './movie.store';
import { Contract, createContractTitleDetail } from '@blockframes/marketplace/app/distribution-deal/+state/cart.model';
import { AuthQuery } from '@blockframes/auth';
import { createImgRef } from '@blockframes/utils/image-uploader';

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
    private permissionsService: PermissionsService,
    private authQuery: AuthQuery,
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

  /** Update deletedBy (_meta field of movie) with the current user and remove the movie. */
  public async remove(movieId: string) {
    const userId = this.authQuery.userId;
    // We need to update the _meta field before remove to get the userId in the backend function: onMovieDeleteEvent
    await this.db.doc(`movies/${movieId}`).update({ "_meta.deletedBy": userId });
    return super.remove(movieId);
  }

  /** Add a partial or a full movie to the database. */
  public async addMovie(original: string, movie?: Movie): Promise<Movie> {
    const id = this.db.createId();
    const userId = this.authQuery.userId;

    if (!movie) {
      // create empty movie
      movie = createMovie({ id, main: { title: { original } }, _meta: { createdBy: userId } });
    } else {
      // we set an id for this new movie
      movie = createMovie({ ...movie, id, _meta: { createdBy: userId } });
    }

    // Add movie document to the database
    await this.add(cleanModel(movie))

    return movie;
  }

  onUpdate(movie: Movie, { write }: WriteOptions) {
    const movieRef = this.db.doc(`movies/${movie.id}`).ref;
    write.update(movieRef, { "_meta.updatedBy": this.authQuery.userId });
  }

  public updateById(id: string, movie: any): Promise<void> {
    // we don't want to keep orgId in our Movie object
    if (movie.organization) delete movie.organization;
    if (movie.stakeholders) delete movie.stakeholders;

    // transform { media: string } into { media: ImgRef }
    if (!!movie.promotionalElements && !!movie.promotionalElements.promotionalElements) {
      movie.promotionalElements.promotionalElements.forEach(el => {
        if (typeof el.media === typeof 'string') {
          el.media = createImgRef(el.media);
        }
      });
    }

    return this.update(id, cleanModel(movie));
  }

  private movieDoc(movieId: string): AngularFirestoreDocument<Movie> {
    return this.db.doc(`movies/${movieId}`);
  }

  /**
   * Fetch a movie from its internal reference (example : AAA1)
   * @param internalRef
   */
  public async getFromInternalRef(internalRef: string): Promise<Movie> {
    const movieSnapShot = await this.db
      .collection('movies', ref => ref.where('main.internalRef', '==', internalRef))
      .get().toPromise();

    return movieSnapShot.docs.length ? createMovie(movieSnapShot.docs[0].data()) : undefined;
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
  public async addDistributionDeal(movieId: string, distributionDeal: DistributionDeal, contract: any): Promise<string> { // @TODO (#1440) replace contract: any with contract: Contract
    // Create an id from DistributionDeal content.
    // A same DistributionDeal document will always have the same hash to prevent multiple insertion of same deal
    // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
    if (!distributionDeal.id) {
      distributionDeal.id = objectHash(distributionDeal);
    }

    // If a contract does not have an id, we update contract and link it to this distrubution deal
    // If there already a contract id, this means it have been created before
    if (!contract.id) {
      // Populate distribution deal contract
      contract.titles[movieId] = createContractTitleDetail();
      contract.titles[movieId].titleId = movieId;
      contract.titles[movieId].distributionDealIds.push(distributionDeal.id);
      // @todo #1397 change this price calculus
      contract.titles[movieId].price = contract.price;

      const contractId = await this.addContract(contract);

      // Link distributiondeal with contract
      distributionDeal.contractId = contractId;
    } else {
      // Link distributiondeal with contract
      distributionDeal.contractId = contract.id;
      // Contract may have been updated along with the distribution deal, we update it
      await this.db.collection('contracts').doc(contract.id).set(contract);
    }


    // @TODO #1389 Use native akita-ng-fire functions : https://netbasal.gitbook.io/akita/angular/firebase-integration/collection-service
    await this.distributionDealsCollection(movieId).doc(distributionDeal.id).set(distributionDeal);
    return distributionDeal.id;
  }

  /**
   * Checks if a distribution deal is already existing for a given movie and returns it.
   * @param movieId
   * @param distributionDeal
   */
  public async existingDistributionDeal(movieId: string, distributionDeal: DistributionDeal): Promise<DistributionDeal> {
    const dealId = distributionDeal.id ? distributionDeal.id : objectHash(distributionDeal);
    const distributionDealSnapshot = await this.distributionDealsCollection(movieId).doc(dealId).get().toPromise();
    return distributionDealSnapshot.exists ? distributionDealSnapshot.data() as DistributionDeal : undefined;
  }

  /**
   * @param movieId
   */
  public async getDistributionDeals(movieId: string): Promise<DistributionDeal[]> {
    const deals = await this.distributionDealsCollection(movieId).get().toPromise();
    return deals.docs.map(doc => this.formatDistributionDeal(doc.data()));
  }

  public formatDistributionDeal(deal: any): DistributionDeal {
    // Dates from firebase are Timestamps, we convert it to Dates.
    if (deal.terms.start instanceof firestore.Timestamp) {
      deal.terms.start = deal.terms.start.toDate();
    }

    if (deal.terms.end instanceof firestore.Timestamp) {
      deal.terms.end = deal.terms.end.toDate();
    }
    return deal as DistributionDeal;
  }


  //////////////////
  /// CONTRACT STUFF
  //////////////////

  /**
   * @param contract
   */
  public async addContract(contract: Contract): Promise<string> {
    if (!contract.id) {
      contract.id = this.db.createId();
    }

    await this.db.collection('contracts').doc(contract.id).set(contract);
    return contract.id;
  }

  /**
   * 
   * @param contractId 
   */
  public async getContract(contractId: string): Promise<Contract> {
    const snapshot = await this.db.collection('contracts').doc(contractId).get().toPromise();
    const doc = snapshot.data();
    return !!doc ? this.formatContract(doc) : undefined;
  }

  /**
   * 
   * @param movieId 
   * @param distributionDealId 
   */
  public async getContractFromDeal(movieId: string, distributionDealId: string): Promise<Contract> {
    const contractSnapShot = await this.db
      .collection(
        `contracts`,
        ref => ref.where(`titles.${movieId}.distributionDealIds`, 'array-contains', distributionDealId)
      )
      .get().toPromise();

    return contractSnapShot.docs.length ? this.formatContract(contractSnapShot.docs[0].data()) : undefined;
  }

  /**
   * 
   * @param contract 
   */
  private formatContract(contract: any): Contract {
    // Dates from firebase are Timestamps, we convert it to Dates.
    if (contract.scope && contract.scope.start instanceof firestore.Timestamp) {
      contract.scope.start = contract.scope.start.toDate();
    }

    if (contract.scope.end instanceof firestore.Timestamp) {
      contract.scope.end = contract.scope.end.toDate();
    }
    return contract as Contract;
  }
}
