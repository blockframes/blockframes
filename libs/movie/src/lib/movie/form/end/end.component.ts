import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie/+state';

@Component({
  selector: 'movie-form-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormEndComponent {
  constructor(private router: Router, private movieQuery: MovieQuery) { }

  navigate() {
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate(['/c/o/dashboard/title/', movieId])
  }
}
