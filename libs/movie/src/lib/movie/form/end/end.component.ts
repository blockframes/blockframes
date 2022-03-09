import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'movie-form-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormEndComponent {

  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId))
  );

  constructor(
    private router: Router,
    private movieService: MovieService,
    private route: ActivatedRoute,
    @Inject(APP) public app: App
  ) { }

  navigate(movieId: string) {
    this.router.navigate(['/c/o/dashboard/title/', movieId, 'main']);
  }
}
