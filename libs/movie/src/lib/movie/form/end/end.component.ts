import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state';
import { App, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'movie-form-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormEndComponent {
  app: App = getCurrentApp(this.routerQuery);

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  constructor(
    private router: Router,
    private movieService: MovieService,
    private routerQuery: RouterQuery,
    private route: ActivatedRoute
  ) { }

  navigate(movieId: string) {
    this.router.navigate(['/c/o/dashboard/title/', movieId, 'main']);
  }
}
