import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { MovieState, MovieService } from '../+state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieContractGuard extends CollectionGuard<MovieState> {
  constructor(protected service: MovieService) {
    super(service);
  }

  /**
   * Sync on movies from contract.titleIds.
   * It means that this guard must always be used after the ActiveContractGuard.
  */
  sync() {
    return this.service.syncContractMovies();
  }
}
