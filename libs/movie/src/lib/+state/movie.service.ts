import { Injectable } from '@angular/core';
import { ID } from '@datorama/akita';
import { HttpClient } from '@angular/common/http';
import { MovieStore } from './movie.store';
import { Movie } from './movie.model';

@Injectable({ providedIn: 'root' })
export class MovieService {

  constructor(private movieStore: MovieStore,
              private http: HttpClient) {
  }

  get() {
    this.http.get('https://akita.com').subscribe((entities) => this.movieStore.set(entities));
  }

  add(movie: Movie) {
    this.movieStore.add(movie);
  }

  update(id, movie: Partial<Movie>) {
    this.movieStore.update(id, movie);
  }

  remove(id: ID) {
    this.movieStore.remove(id);
  }
}
