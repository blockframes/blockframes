import { MovieService } from './../+state/movie.service';
import { MovieState } from './../+state/movie.store';
import { Injectable } from '@angular/core';
import { CollectionGuard } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
export class MovieCollectionGuard extends CollectionGuard<MovieState> {
  constructor(service: MovieService) {
    super(service);
  }
}
