import { Injectable } from '@angular/core';
import { OrganizationQuery, Organization } from '@blockframes/organization';
import {
  CollectionConfig,
  CollectionService,
  WriteOptions,
  awaitSyncQuery,
  Query
} from 'akita-ng-fire';
import { switchMap, tap } from 'rxjs/operators';
import { createMovie, Movie } from './movie.model';
import { MovieState, MovieStore } from './movie.store';
import { AuthQuery } from '@blockframes/auth';
import { createImgRef } from '@blockframes/utils/image-uploader';
import { ContractQuery } from '@blockframes/contract/+state/contract.query';
import { Contract } from '@blockframes/contract/+state/contract.model';

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

/** Query movies from the contract with distributions deals from the last version. */
const movieListContractQuery = (contract: Contract, movieIds: string[]): Query<Movie[]> => ({
  path: 'movies',
  queryFn: ref => ref.where('id', 'in', movieIds),
  distributionDeals: (movie: Movie) => ({
    path: `movies/${movie.id}/distributiondeals`,
    queryFn: ref => ref.where('id', 'in', contract.lastVersion.titles[movie.id].distributionDealIds)
  })
});

// TODO#944 - refactor CRUD operations
@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {
  constructor(
    private organizationQuery: OrganizationQuery,
    private contractQuery: ContractQuery,
    private authQuery: AuthQuery,
    store: MovieStore
  ) {
    super(store);
  }

  /** Gets every movieIds of the user active organization and sync them. */
  public syncOrgMovies() {
    return this.organizationQuery
      .selectActive()
      .pipe(switchMap(org => this.syncManyDocs(org.movieIds)));
  }

  /** Gets every movies Id from contract and sync them if they belong to active. */
  public syncContractMovies() {
    return this.contractQuery.selectActive().pipe(
      // Reset the store everytime the movieId changes.
      tap(_ => this.store.reset()),
      switchMap(contract => {
        // Filter movieIds before the query to relieve it.
        const organizationMovieIds = this.organizationQuery.getActive().movieIds;
        const movieIds = contract.titleIds.filter(titleId => organizationMovieIds.includes(titleId));

        return awaitSyncQuery.call(this, movieListContractQuery(contract, movieIds))
      }
      )
    );
  }

  /** Update deletedBy (_meta field of movie) with the current user and remove the movie. */
  public async remove(movieId: string) {
    const userId = this.authQuery.userId;
    // We need to update the _meta field before remove to get the userId in the backend function: onMovieDeleteEvent
    await this.db.doc(`movies/${movieId}`).update({ '_meta.deletedBy': userId });
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
    await this.add(cleanModel(movie));

    return movie;
  }

  onUpdate(movie: Movie, { write }: WriteOptions) {
    const movieRef = this.db.doc(`movies/${movie.id}`).ref;
    write.update(movieRef, { '_meta.updatedBy': this.authQuery.userId });
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

  /**
   * Fetch a movie from its internal reference (example : AAA1)
   * @param internalRef
   */
  // @TODO #1389 Use native akita-ng-fire functions
  public async getFromInternalRef(internalRef: string): Promise<Movie> {
    const movieSnapShot = await this.db
      .collection('movies', ref => ref.where('main.internalRef', '==', internalRef))
      .get()
      .toPromise();

    return movieSnapShot.docs.length ? createMovie(movieSnapShot.docs[0].data()) : undefined;
  }
}
