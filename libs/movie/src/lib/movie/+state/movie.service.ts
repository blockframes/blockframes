import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { switchMap, filter, tap, map } from 'rxjs/operators';
import {
  createMovie,
  Movie,
  MovieAnalytics,
  SyncMovieAnalyticsOptions,
  createStoreConfig,
} from './movie.model';
import { createDocumentMeta } from "@blockframes/utils/models-meta";
import { MovieState, MovieStore } from './movie.store';
import { cleanModel } from '@blockframes/utils/helpers';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable } from 'rxjs';
import { MovieQuery } from './movie.query';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { UserService } from '@blockframes/user/+state/user.service';
import { firestore } from 'firebase/app';
import { createMovieAppAccess, getCurrentApp } from '@blockframes/utils/apps';
import { QueryFn } from '@angular/fire/firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';

export const fromOrg = (orgId: string): QueryFn => ref => ref.where('orgIds', 'array-contains', orgId);

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {

  constructor(
    private authQuery: AuthQuery,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private routerQuery: RouterQuery,
    private functions: AngularFireFunctions,
    private query: MovieQuery,
    protected store: MovieStore,
    private orgQuery: OrganizationQuery
  ) {
    super(store);
  }

  formatFromFirestore(movie: any) {
    return createMovie(movie);
  }

  async create(movieImported?: Movie): Promise<Movie> {
    const createdBy = this.authQuery.userId;
    const appName = getCurrentApp(this.routerQuery);
    let orgIds = [];
    if (!!movieImported?.orgIds.length) {
      orgIds = movieImported.orgIds;
    } else {
      const orgId = this.orgQuery.getActiveId();
      orgIds.push(orgId);
    }

    const movie = createMovie({
      _meta: createDocumentMeta({ createdBy }),
      orgIds,
      ...movieImported
    });
    movie.storeConfig = {
      ...createStoreConfig(),
      appAccess: createMovieAppAccess({ [appName]: true })
    };
    await this.runTransaction(async (tx) => {
      movie.id = await this.add(cleanModel(movie), { write: tx });
    });
    return movie;
  }

  async onCreate(movie: Movie, { write }: WriteOptions) {
    // When a movie is created, we also create a permissions document for it.
    // Since movie can be created on behalf of another user (An admin from admin panel for example)
    const userId = movie._meta?.createdBy ? movie._meta.createdBy : this.authQuery.userId;
    const user = await this.userService.getUser(userId);
    const ref = this.getRef(movie.id);
    write.update(ref, { '_meta.createdAt': new Date() });
    return this.permissionsService.addDocumentPermissions(movie.id, write as firestore.Transaction, user.orgId);
  }

  onUpdate(movie: Movie, { write }: WriteOptions) {
    const movieRef = this.db.doc(`movies/${movie.id}`).ref;
    write.update(movieRef, {
      '_meta.updatedBy': this.authQuery.userId,
      '_meta.updatedAt': new Date()
    });
  }

  /** Update deletedBy (_meta field of movie) with the current user and remove the movie. */
  public async remove(movieId: string) {
    const userId = this.authQuery.userId;
    // We need to update the _meta field before remove to get the userId in the backend function: onMovieDeleteEvent
    await this.db.doc(`movies/${movieId}`).update({
      '_meta.deletedBy': userId,
      '_meta.deletedAt': new Date()
    });
    return super.remove(movieId);
  }

  /** Gets every analytics for all movies and sync them. */
  public syncWithAnalytics(movieIds: string[], options?: SyncMovieAnalyticsOptions) {
    return this.query.analytics.select('ids').pipe(
      filter(analyticsIds => movieIds.some(id => !analyticsIds.includes(id))),
      switchMap(_ => {
        const f = this.functions.httpsCallable('getMovieAnalytics');
        return f({ movieIds, daysPerRange: 28 });
      }),
      tap(analytics => this.store.analytics.upsertMany(analytics))
    );
  }

  /**
   * Fetch a movie from its internal reference (example : AAA1)
   * @param internalRef
   */
  public async getFromInternalRef(internalRef: string): Promise<Movie> {
    const movies = await this.getValue(ref => ref.where('internalRef', '==', internalRef))

    return movies.length ? createMovie(movies[0]) : undefined;
  }

  /** Call a firebase function to get analytics specify to an array of movieIds.*/
  public getMovieAnalytics(movieIds: string[]): Observable<MovieAnalytics[]> {
    const f = this.functions.httpsCallable('getMovieAnalytics');
    return f({ movieIds, daysPerRange: 28 });
  }

  /**
   * @dev ADMIN method
   * Fetch all movies for administration uses
   */
  public async getAllMovies(): Promise<Movie[]> {
    const movies = await this.getValue()

    return movies.map(movie => createMovie(movie));
  }
}
