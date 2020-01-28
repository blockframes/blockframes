import { Injectable } from "@angular/core";
import { CollectionGuard, CollectionGuardConfig } from "akita-ng-fire";
import { MovieState } from "../+state/movie.store";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot } from "@angular/router";
import { map } from "rxjs/operators";

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class MovieActiveGuard extends CollectionGuard<MovieState> {

  constructor(service: MovieService) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.movieId }).pipe(
      map(movie =>  movie ? true : (this.redirect || next.data.redirect))
    )
  }
}
