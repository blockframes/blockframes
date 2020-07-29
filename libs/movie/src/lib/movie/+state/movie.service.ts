import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { switchMap, filter, tap, map } from 'rxjs/operators';
import { createMovie, Movie, MovieAnalytics, SyncMovieAnalyticsOptions, createStoreConfig } from './movie.model';
import { MovieState, MovieStore } from './movie.store';
import { cleanModel } from '@blockframes/utils/helpers';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable, combineLatest, of } from 'rxjs';
import { MovieQuery } from './movie.query';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { PrivateConfig } from '@blockframes/utils/common-interfaces/utility';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { UserService } from '@blockframes/user/+state/user.service';
import { MediaService } from '@blockframes/media/+state/media.service';
import { firestore } from 'firebase/app';
import { createMovieAppAccess, getCurrentApp } from '@blockframes/utils/apps';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {

  constructor(
    private authQuery: AuthQuery,
    private permissionsService: PermissionsService,
    private userService: UserService,
    private orgService: OrganizationService,
    private mediaService: MediaService,
    private routerQuery: RouterQuery,
    private functions: AngularFireFunctions,
    private query: MovieQuery,
    protected store: MovieStore,
  ) {
    super(store);
  }

  async create(movieImported?: Movie): Promise<Movie> {
    const createdBy = this.authQuery.userId;
    const appName = getCurrentApp(this.routerQuery);
    const movie = createMovie({
      _meta: { createdBy },
      ...movieImported
    });
    movie.main.storeConfig = {
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
    // We use createdBy attribute to fetch OrgId
    const userId = movie._meta?.createdBy ? movie._meta.createdBy : this.authQuery.userId;
    const user = await this.userService.getUser(userId);

    // We need to update the organisation here, because of the route navigation in the movie tunnel.
    // If we do it in the backend functions, the org isn't updated fast enough to allow a good navigation in the movie tunnel
    await this.orgService.update(user.orgId, (org) => ({ movieIds: [...org.movieIds, movie.id] }), { write })
    return this.permissionsService.addDocumentPermissions(movie.id, write as firestore.Transaction, user.orgId);
  }

  onUpdate(movie: Movie, { write }: WriteOptions) {
    const movieRef = this.db.doc(`movies/${movie.id}`).ref;
    write.update(movieRef, { '_meta.updatedBy': this.authQuery.userId });
  }

  /** Update deletedBy (_meta field of movie) with the current user and remove the movie. */
  public async remove(movieId: string) {
    const userId = this.authQuery.userId;
    // We need to update the _meta field before remove to get the userId in the backend function: onMovieDeleteEvent
    await this.db.doc(`movies/${movieId}`).update({ '_meta.deletedBy': userId });
    return super.remove(movieId);
  }

  /** Gets every analytics for all movies and sync them. */
  // @todo(#2684) use syncWithAnalytics instead
  public syncAnalytics(options?: SyncMovieAnalyticsOptions) {
    return combineLatest([
      this.query.selectAll(options).pipe(map(movies => movies.map(m => m.id))),
      this.query.analytics.select('ids')
    ]).pipe(
      filter(([movieIds, analyticsIds]) => movieIds.some(id => !analyticsIds.includes(id))),
      switchMap(([movieIds]) => {
        const f = this.functions.httpsCallable('getMovieAnalytics');
        return f({ movieIds, daysPerRange: 28 });
      }),
      tap(analytics => this.store.analytics.upsertMany(analytics))
    )
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

  public updateById(id: string, movie: any): Promise<void> {
    // we don't want to keep orgId in our Movie object
    if (movie.organization) delete movie.organization;
    if (movie.stakeholders) delete movie.stakeholders;

    return this.update(id, cleanModel(movie));
  }

  /**
   * Fetch a movie from its internal reference (example : AAA1)
   * @param internalRef
   */
  public async getFromInternalRef(internalRef: string): Promise<Movie> {
    const movies = await this.getValue(ref => ref.where('main.internalRef', '==', internalRef))

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

  /**
   * @dev ADMIN method
   * Https callable function to set privateConfig for a movie.
   */
  public async setMoviePrivateConfig(movieId: string, privateConfig: PrivateConfig): Promise<any> {
    const f = this.functions.httpsCallable('setDocumentPrivateConfig');
    return f({ docId: movieId, config: privateConfig }).toPromise();
  }

  /**
   * @dev ADMIN method
   * Https callable function to get privateConfig for a movie.
   * @param movieId
   * @param keys the keys to retreive
   */
  public async getMoviePrivateConfig(movieId: string, keys: string[] = []): Promise<PrivateConfig> {
    const f = this.functions.httpsCallable('getDocumentPrivateConfig');
    return f({ docId: movieId, keys }).toPromise();
  }
}
