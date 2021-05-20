import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, WriteOptions } from 'akita-ng-fire';
import {
  createMovie,
  Movie,
  createMovieAppConfig,
} from './movie.model';
import { createDocumentMeta } from "@blockframes/utils/models-meta";
import { MovieState, MovieStore } from './movie.store';
import { cleanModel } from '@blockframes/utils/helpers';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { UserService } from '@blockframes/user/+state/user.service';
import type firebase from 'firebase';
import { App } from '@blockframes/utils/apps';
import { QueryFn } from '@angular/fire/firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';

export const fromOrg = (orgId: string): QueryFn => ref => ref.where('orgIds', 'array-contains', orgId);
export const fromOrgAndAccepted = (orgId: string, appli: App): QueryFn => ref => ref.where(`app.${appli}.status`, '==', 'accepted').where('orgIds', 'array-contains', orgId);
export const fromOrgAndInternalRef = (orgId: string, internalRef: string): QueryFn => ref => ref.where('orgIds', 'array-contains', orgId).where('internalRef', '==', internalRef);
export const fromInternalRef = (internalRef: string): QueryFn => ref => ref.where('internalRef', '==', internalRef);

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'movies' })
export class MovieService extends CollectionService<MovieState> {
  readonly useMemorization = true;

  constructor(
    private authQuery: AuthQuery,
    private permissionsService: PermissionsService,
    private userService: UserService,
    protected store: MovieStore,
    private orgQuery: OrganizationQuery
  ) {
    super(store);
  }

  formatFromFirestore(movie: any) {
    return createMovie(movie);
  }

  async create(movieImported?: Partial<Movie>): Promise<Movie> {
    const createdBy = this.authQuery.userId;
    let orgIds = [];
    if (movieImported?.orgIds?.length) {
      orgIds = movieImported.orgIds;
    } else {
      const orgId = this.orgQuery.getActiveId();
      orgIds.push(orgId);
    }

    const movie = createMovie({
      _meta: createDocumentMeta({ createdBy }),
      ...movieImported,
      orgIds
    });
    movie.app = {
      ...createMovieAppConfig(movieImported?.app)
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
    write.update(ref, { '_meta.createdAt': new Date()});
    return this.permissionsService.addDocumentPermissions(movie.id, write as firebase.firestore.Transaction, user.orgId);
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

  /**
   * Fetch a movie from its internal reference (example : AAA1)
   * @param internalRef
   */
  public async getFromInternalRef(internalRef: string, orgId?: string): Promise<Movie> {
    const query = orgId ? fromOrgAndInternalRef(orgId, internalRef) : fromInternalRef(internalRef)
    const movies = await this.getValue(query);
    return movies.length ? createMovie(movies[0]) : undefined;
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
