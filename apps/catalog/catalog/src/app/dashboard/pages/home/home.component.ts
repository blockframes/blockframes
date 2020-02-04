import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
;

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  public movies$ = this.movieQuery.selectAll();

  constructor(
    private movieQuery: MovieQuery
  ) {}

}
