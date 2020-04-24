import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { switchMap, filter, tap, map } from 'rxjs/operators';
import { createMovie, Movie, MovieAnalytics, SyncMovieAnalyticsOptions, createAppAccessWithApp, createStoreConfig } from './movie.model';
import { MovieState, MovieStore } from './movie.store';
import { UserService } from '@blockframes/user/+state/user.service';
import { createImgRef } from '@blockframes/utils/image-uploader';
import { cleanModel } from '@blockframes/utils/helpers';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable, combineLatest } from 'rxjs';
import { MovieQuery } from './movie.query';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { PrivateConfig } from '@blockframes/utils/common-interfaces/utility';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {


  constructor(
    private authQuery: AuthQuery,
    private userService: UserService,
    private permissionsService: PermissionsService,
    private orgService: OrganizationService,
    private orgQuery: OrganizationQuery,
    private routerQuery: RouterQuery,
    private functions: AngularFireFunctions,
    private query: MovieQuery,
    protected store: MovieStore,
  ) {
    super(store);
  }

  async create(movieImported?: Movie): Promise<string> {
    const createdBy = this.authQuery.getValue().uid;
    const appName = this.routerQuery.getValue().state.root.data.app;
    const movie = createMovie({
      _meta: { createdBy },
      ...movieImported
    });
    movie.main.storeConfig = {
      ...createStoreConfig(),
      appAccess: createAppAccessWithApp(appName)
    };
    let movieId: string;
    await this.runTransaction(async (tx) => {

      // Add movie and update the organization to add the movie ID to the org
      movieId = await this.add(cleanModel(movie), { write: tx });
      await this.orgService.update(this.orgQuery.getActiveId(), (org) => ({ movieIds: [...org.movieIds, movieId] }), { write: tx });

      // When a movie is created, we also create a permissions document for it.
      // Since movie can be created on behalf of another user (An admin from admin panel for example)
      // We use createdBy attribute to fetch OrgId
      this.permissionsService.addDocumentPermissions(movieId, tx, this.orgQuery.getActiveId());
    });
    return movieId;
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
