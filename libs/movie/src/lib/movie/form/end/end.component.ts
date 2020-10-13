import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { MovieQuery } from '@blockframes/movie/+state';
import { App } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'movie-form-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormEndComponent {
  app: App = this.route.getData('app');
  constructor(
    private router: Router,
    private movieQuery: MovieQuery,
    private route: RouterQuery
  ) { }

  navigate() {
    const movieId = this.movieQuery.getActiveId();
    this.router.navigate(['/c/o/dashboard/title/', movieId, 'main'])
  }
}
