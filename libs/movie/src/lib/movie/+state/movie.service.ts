import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { switchMap, filter, tap, map } from 'rxjs/operators';
import { createMovie, Movie, MovieAnalytics, SyncMovieAnalyticsOptions } from './movie.model';
import { MovieState, MovieStore } from './movie.store';
import { AuthQuery, AuthService } from '@blockframes/auth';
import { createImgRef } from '@blockframes/utils/image-uploader';
import { cleanModel } from '@blockframes/utils/helpers';
import { firestore } from 'firebase/app';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Observable, combineLatest } from 'rxjs';
import { MovieQuery } from './movie.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {
  constructor(
    private authQuery: AuthQuery,
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private functions: AngularFireFunctions,
    private query: MovieQuery,
    protected store: MovieStore,
  ) {
    super(store);
  }

  async onCreate(movie: Movie, { write }: WriteOptions) {
    // When a movie is created, we also create a permissions document for it.
    // Since movie can be created on behalf of another user (An admin from admin panel for example)
    // We use createdBy attribute to fetch OrgId
    const userId = movie._meta?.createdBy ? movie._meta.createdBy : this.authQuery.userId;
    const user = await this.authService.getUser(userId);
    return this.permissionsService.addDocumentPermissions(movie, write as firestore.WriteBatch, user.orgId);
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

  /** Add a partial or a full movie to the database. */
  public async addMovie(original: string, movie?: Movie): Promise<Movie> {
    const id = this.db.createId();
    const userId = movie._meta?.createdBy ? movie._meta.createdBy : this.authQuery.userId;

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
  // @TODO #1389 Use native akita-ng-fire functions
  public async getAllMovies(): Promise<Movie[]> {
    const movies = await this.getValue()

    return movies.map(movie => createMovie(movie));
  }
}
