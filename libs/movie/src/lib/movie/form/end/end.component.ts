import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state';
import { App } from '@blockframes/utils/apps';
import { AppGuard } from '@blockframes/utils/routes/app.guard';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'movie-form-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormEndComponent {
  app: App = this.appGuard.currentApp;

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  constructor(
    private router: Router,
    private movieService: MovieService,
    private route: ActivatedRoute,
    private appGuard: AppGuard,
  ) { }

  navigate(movieId: string) {
    this.router.navigate(['/c/o/dashboard/title/', movieId, 'main']);
  }
}
