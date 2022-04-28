import { Injectable, Inject } from '@angular/core';
import { createMovie, Movie, createMovieAppConfig, createDocumentMeta, StoreStatus, App } from '@blockframes/model';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import type firestore from 'firebase/firestore';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { map } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { APP } from '@blockframes/utils/routes/utils';
import { where, doc, updateDoc, DocumentSnapshot } from 'firebase/firestore';
import { WriteOptions } from 'ngfire';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

export const fromOrg = (orgId: string) =>
  [where('orgIds', 'array-contains', orgId)];
export const fromOrgAndAccepted = (orgId: string, appli: App) =>
  [where(`app.${appli}.status`, '==', 'accepted'), where(`app.${appli}.access`, '==', true), where('orgIds', 'array-contains', orgId)];
export const fromOrgAndInternalRef = (orgId: string, internalRef: string) =>
  [where('orgIds', 'array-contains', orgId), where('internalRef', '==', internalRef)];
export const fromInternalRef = (internalRef: string) =>
  [where('internalRef', '==', internalRef)];


@Injectable({ providedIn: 'root' })
export class MovieService extends BlockframesCollection<Movie> {
  readonly path = 'movies';

  constructor(
    private authService: AuthService,
    private permissionsService: PermissionsService,
    private orgService: OrganizationService,
    @Inject(APP) public app: App
  ) {
    super();
  }

  protected fromFirestore(snapshot: DocumentSnapshot<Movie>) {
    const movie = super.fromFirestore(snapshot);
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
      movie.id = await this.add(movie, { write: tx });
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
      '_meta.updatedAt', new Date(),
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

    return this.valueChanges(query).pipe(
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
