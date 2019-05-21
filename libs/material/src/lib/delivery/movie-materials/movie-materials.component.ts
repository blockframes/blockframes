import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from 'libs/movie/src/lib/movie/+state/movie.model';
import { MovieQuery } from 'libs/movie/src/lib/movie/+state/movie.query';
import { DeliveryQuery } from '../+state';
import { TemplateView } from '../../template/+state';

@Component({
  selector: 'delivery-movie-materials',
  templateUrl: './movie-materials.component.html',
  styleUrls: ['./movie-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieMaterialsComponent implements OnInit {
  public movie$: Observable<Movie>;
  public materials$: Observable<TemplateView>;
  public progressionValue$: Observable<number>;

  constructor(
    private movieQuery: MovieQuery,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.movie$ = this.movieQuery.selectActive();
    this.materials$ = this.query.currentTemplate$;
    this.progressionValue$ = this.query.movieProgression$;
  }

}
