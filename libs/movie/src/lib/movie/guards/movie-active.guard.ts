import { Injectable } from "@angular/core";
import { CollectionGuard } from "akita-ng-fire";
import { MovieState } from "../+state/movie.store";
import { MovieService } from "../+state/movie.service";
import { ActivatedRouteSnapshot } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class ActiveMovieGuard extends CollectionGuard<MovieState> {

  constructor(service: MovieService) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot) {
    console.log(next.params.movieId)
    return this.service.syncActive({ id: next.params.movieId });
  }
}
