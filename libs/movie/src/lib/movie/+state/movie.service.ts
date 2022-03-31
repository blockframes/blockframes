import { Injectable, Inject } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { createMovie, Movie, createMovieAppConfig, createDocumentMeta } from '@blockframes/model';
import { cleanModel } from '@blockframes/utils/helpers';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import type firebase from 'firebase';
import { App } from '@blockframes/utils/apps';
import { QueryFn } from '@angular/fire/firestore';
import { OrganizationService } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { joinWith } from '@blockframes/utils/operators';
import { AnalyticsService } from '@blockframes/analytics/+state/analytics.service';
import { AuthService } from '@blockframes/auth/+state';
import { ActiveState, EntityState } from '@datorama/akita';
import { storeStatus, StoreStatus } from '@blockframes/utils/static-model';
import { APP } from '@blockframes/utils/routes/utils';

export const fromOrg = (orgId: string): QueryFn => (ref) =>
  ref.where('orgIds', 'array-contains', orgId);
export const fromOrgAndAccepted = (orgId: string, appli: App): QueryFn => (ref) =>
  ref.where(`app.${appli}.status`, '==', 'accepted').where(`app.${appli}.access`, '==', true).where('orgIds', 'array-contains', orgId);
export const fromOrgAndInternalRef = (orgId: string, internalRef: string): QueryFn => (ref) =>
  ref.where('orgIds', 'array-contains', orgId).where('internalRef', '==', internalRef);
export const fromInternalRef = (internalRef: string): QueryFn => (ref) =>
  ref.where('internalRef', '==', internalRef);

interface MovieState extends EntityState<Movie, string>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {
  readonly useMemorization = true;

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private analyticService: AnalyticsService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) {
    super();
  }

  formatFromFirestore(movie) {
    return createMovie(movie);
  }

  async create(movieImported?: Partial<Movie>): Promise<Movie> {
    const createdBy = this.authService.uid;
    let orgIds = [];
    if (movieImported?.orgIds?.length) {
      orgIds = movieImported.orgIds;
    } else {
      const orgId = this.orgService.org.id;
      orgIds.push(orgId);
    }

    const movie = createMovie({
      _meta: createDocumentMeta({ createdBy }),
      ...movieImported,
      orgIds,
    });
    movie.app = {
      ...createMovieAppConfig(movieImported?.app),
    };
    await this.runTransaction(async (tx) => {
      movie.id = await this.add(cleanModel(movie), { write: tx });
    });
    return movie;
  }

  onCreate(movie: Movie, { write }: WriteOptions) {
    const ref = this.getRef(movie.id);
    write.update(ref, { '_meta.createdAt': new Date() });
    for (const orgId of movie.orgIds) {
      this.permissionsService.addDocumentPermissions(
        movie.id,
        write as firebase.firestore.Transaction,
        orgId
      );
    }
  }

  onUpdate(movie: Movie, { write }: WriteOptions) {
    const movieRef = this.db.doc(`movies/${movie.id}`).ref;
    write.update(movieRef, {
      '_meta.updatedBy': this.authService.uid,
      '_meta.updatedAt': new Date(),
    });
  }

  /** Update deletedBy (_meta field of movie) with the current user and remove the movie. */
  public async remove(movieId: string) {
    const userId = this.authService.uid;
    // We need to update the _meta field before remove to get the userId in the backend function: onMovieDeleteEvent
    await this.db.doc(`movies/${movieId}`).update({
      '_meta.deletedBy': userId,
      '_meta.deletedAt': new Date(),
    });
    return super.remove(movieId);
  }

  /**
   * Fetch a movie from its internal reference (example : AAA1)
   * @param internalRef
   */
  public async getFromInternalRef(internalRef: string, orgId?: string): Promise<Movie> {
    const query = orgId ? fromOrgAndInternalRef(orgId, internalRef) : fromInternalRef(internalRef);
    const movies = await this.getValue(query);
    return movies.length ? createMovie(movies[0]) : undefined;
  }

  queryDashboard(app: App) {
    const orgId = this.orgService.org.id;
    const query: QueryFn = ref => ref.where('orgIds', 'array-contains', orgId).where(`app.${app}.access`, '==', true);

    return this.valueChanges(query).pipe(
      joinWith({
        analytics: movie => this.analyticService.valueChanges(ref => ref
          .where('type', '==', 'title')
          .where('name', '==', 'pageView')
          .where('meta.titleId', '==', movie.id)
          .where('meta.ownerOrgIds', 'array-contains', orgId)
          .where('_meta.createdFrom', '==', app)
        ),
      }),
      map(movies => movies.sort((a, b) => a.title.international < b.title.international ? -1 : 1))
    );
  }

  public updateStatus(movieId: string, status: StoreStatus) {
    return this.update(movieId, movie => ({
      ...movie,
      app: {
        ...movie.app,
        [this.app]: {
          ...movie.app[this.app],
          status,
        },
      },
    }));
  }
}
