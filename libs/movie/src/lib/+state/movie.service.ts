import { Injectable } from '@angular/core';
import { MovieStore } from './movie.store';

@Injectable({ providedIn: 'root' })
export class MovieService {

  constructor(private movieStore: MovieStore) {
  }

}
