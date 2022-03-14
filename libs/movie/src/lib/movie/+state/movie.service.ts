import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import { createMovie, Movie, createMovieAppConfig, MovieAnalytics } from '@blockframes/model';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { cleanModel } from '@blockframes/utils/helpers';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import type firestore from 'firebase/firestore';
import { App } from '@blockframes/utils/apps';
import { OrganizationService } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { getViews } from '../pipes/analytics.pipe';
import { joinWith } from '@blockframes/utils/operators';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';
import { AuthService } from '@blockframes/auth/+state';
import { ActiveState, EntityState } from '@datorama/akita';
import { where } from 'firebase/firestore';
import { doc, updateDoc } from '@angular/fire/firestore';

export const fromOrg = (orgId: string) =>
  [where('orgIds', 'array-contains', orgId)];
export const fromOrgAndAccepted = (orgId: string, appli: App) =>
  [where(`app.${appli}.status`, '==', 'accepted'), where('orgIds', 'array-contains', orgId)];
export const fromOrgAndInternalRef = (orgId: string, internalRef: string) =>
  [where('orgIds', 'array-contains', orgId), where('internalRef', '==', internalRef)];
export const fromInternalRef = (internalRef: string) =>
  [where('internalRef', '==', internalRef)];

type MovieWithAnalytics = Movie & { analytics: MovieAnalytics };

interface MovieState extends EntityState<Movie, string>, ActiveState<string> { }

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {
  readonly useMemorization = true;

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private analyticservice: AnalyticsService,
    private orgService: OrganizationService
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
    write.update(ref, '_meta.createdAt', new Date());
    for (const orgId of movie.orgIds) {
      this.permissionsService.addDocumentPermissions(
        movie.id,
        write as firestore.Transaction,
        orgId
      );
    }
  }

  onUpdate(movie: Movie, { write }: WriteOptions) {
    const movieRef = doc(this.db, `movies/${movie.id}`);
    write.update(movieRef,
      '_meta.updatedBy', this.authService.uid,
      '_meta.updatedAt', new Date(), // TODO #7273 check
    );
  }

  /** Update deletedBy (_meta field of movie) with the current user and remove the movie. */
  public async remove(movieId: string) {
    const userId = this.authService.uid;
    // We need to update the _meta field before remove to get the userId in the backend function: onMovieDeleteEvent
    const movieRef = doc(this.db, `movies/${movieId}`);
    await updateDoc(movieRef, {
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
    const query = [
      where('orgIds', 'array-contains', orgId),
      where(`app.${app}.access`, '==', true)
    ];
    const addViews = (movie: MovieWithAnalytics) => ({
      ...movie,
      analytics: { ...movie.analytics, views: getViews(movie.analytics) },
    });

    return this.valueChanges(query).pipe(
      joinWith({
        analytics: (movie) => this.analyticservice.valueChanges(movie.id),
      }),
      map((movies) => movies.map(addViews)),
      map((movies) =>
        movies.sort((a, b) => (a.title.international < b.title.international ? -1 : 1))
      )
    );
  }
}
