import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryQuery } from '../+state';

@Component({
  selector: 'delivery-movie-materials',
  templateUrl: './movie-materials.component.html',
  styleUrls: ['./movie-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialsComponent implements OnInit {
  public movie: Movie;
  public materials$: Observable<Object>;
  public progressionValue$: Observable<number>;

  public isAlive = true;

  constructor(
    private movieQuery: MovieQuery,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.movie = this.movieQuery.getActive();
    this.materials$ = this.query.currentMovieTemplateView;
    this.progressionValue$ = this.query.movieProgression$;
  }

  public randomNumberPicker(scale: number) {
    return Math.floor(Math.random() * scale) + 1;
  }
}
