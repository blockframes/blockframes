import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';

@Component({
  selector: 'festival-dashboard-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TitleViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;

  navLinks: RouteDescription[] = [
    {
      path: 'main',
      label: 'Main'
    },
    {
      path: 'artistic',
      label: 'Artistic'
    },
    {
      path: 'production',
      label: 'Production'
    },
    {
      path: 'additional',
      label: 'Additional'
    }
  ];

  constructor(private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }
}
