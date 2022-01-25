import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Observable } from 'rxjs';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';

@Component({
  selector: 'catalog-title-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleActivityComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;

  constructor(
    private analyticsService: AnalyticsService,
    private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    const movieId = this.movieQuery.getActiveId();
    this.movieAnalytics$ = this.analyticsService.valueChanges([movieId])
  }
}
