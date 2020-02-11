import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Observable } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { map, switchMap } from 'rxjs/operators';

const eventList = ['movieViews', 'addedToWishlist', 'promoReelOpened'];
@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public eventList = eventList;
  public loading$: Observable<boolean>;

  constructor(private movieQuery: MovieQuery, private movieService: MovieService) {}

  ngOnInit() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movieAnalytics$ = this.movieQuery.select('ids').pipe(
      switchMap(ids => this.movieService.getMovieAnalytics(ids))
    );
  }

}
