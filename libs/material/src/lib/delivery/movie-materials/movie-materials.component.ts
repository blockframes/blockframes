import { ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryQuery } from '../+state';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'delivery-movie-materials',
  templateUrl: './movie-materials.component.html',
  styleUrls: ['./movie-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialsComponent implements OnInit, OnDestroy {
  public movie: Movie;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  public isAlive = true;

  constructor(
    private movieQuery: MovieQuery,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.query
      .materialsByActiveMovie()
      .pipe(takeWhile(() => this.isAlive))
      .subscribe(); // TODO : remove after Cannes in favor of routes.
    this.movie = this.movieQuery.getActive();
    this.materials$ = this.query.currentMovieTemplateView;
    this.progressionValue$ = this.query.movieProgression$;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
