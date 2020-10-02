import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie/+state';
import { App } from '@blockframes/utils/apps';

@Component({
  selector: 'movie-form-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormEndComponent {
  app: App = this.route.snapshot.data.app;
  constructor(
    private router: Router,
    private movieQuery: MovieQuery,
    private route: ActivatedRoute
  ) { }

  navigate() {
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate(['/c/o/dashboard/title/', movieId, 'main'])
  }
}
