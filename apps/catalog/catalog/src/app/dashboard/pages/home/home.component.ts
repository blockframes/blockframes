import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Observable } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { map } from 'rxjs/operators';

const eventList = ['movieViews', 'addedToWishlist', 'promoReelOpened'];
@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public movies$ = this.movieQuery.selectAll().pipe(
    map(movie => movie.map(movie => movie.id))
  );
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public eventList = eventList;
  public movieIdList: string[];

  constructor(
    private movieQuery: MovieQuery, private movieService: MovieService
  ) {}

  ngOnInit() {
    const moiveIds = this.movies$.subscribe(id => this.movieIdList = id)
    this.movieAnalytics$ = this.movieService.getMovieAnalytics(this.movieIdList);
  }

}
