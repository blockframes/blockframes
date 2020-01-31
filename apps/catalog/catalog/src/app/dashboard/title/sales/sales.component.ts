import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.model';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';

@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSalesComponent implements OnInit {

  public movieAnalytics: Observable<MovieAnalytics[]>;

  constructor(private movieService: MovieService, private movieQuery: MovieQuery) { }

  ngOnInit() {
    this.movieAnalytics = this.movieService.getMovieAnalytics([this.movieQuery.getActiveId()]);
  }
}
