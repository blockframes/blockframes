import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';
import { Observable } from 'rxjs';

const eventList = ['movieViews', 'addedToWishlist', 'promoReelOpened'];

@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSalesComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public eventList = eventList;
  
  constructor(private movieService: MovieService, private movieQuery: MovieQuery) {}

  ngOnInit() {
    const movieId = this.movieQuery.getActiveId();
    this.movieAnalytics$ = this.movieService.getMovieAnalytics([movieId]);
  }
}
