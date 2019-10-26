import { AFM_DISABLE } from '@env';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { Movie, MovieQuery } from '@blockframes/movie/movie/+state';

interface CarouselSection {
  title: string;
  subline: string;
  movies: Partial<Movie>[];
}
@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceHomeComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-marketplace-homepage';
  /** Observable to fetch all movies from the store */
  public moviesBySections$: Observable<CarouselSection[]>;

  constructor(private movieQuery: MovieQuery) {}

  ngOnInit() {
    // TODO issue#1146
    if (!AFM_DISABLE) {
      const allMovies$ = this.movieQuery.selectAll({
        filterBy: movies => movies.main.productionYear >= 2018
      });
      const inProduction$ = this.movieQuery.selectAll({
        filterBy: movies => movies.main.status === 'on production'
      });
      const finished$ = this.movieQuery.selectAll({
        filterBy: movies => movies.main.status === 'finished'
      });

      this.moviesBySections$ = combineLatest([allMovies$, inProduction$, finished$]).pipe(
        map(([allMovies, inProduction, finished]) => {
          return [
            { title: 'New Films', subline: '', movies: allMovies },
            {
              title: 'In Production',
              subline: '',
              movies: inProduction
            },
            {
              title: 'Completed Films',
              subline: '',
              movies: finished
            }
          ];
        })
      );
    } else {
      const latest$ = this.movieQuery.selectAll({
        filterBy: movies => movies.main.productionYear >= 2018
      });
      const scoring$ = this.movieQuery.selectAll({
        filterBy: movies => movies.salesInfo.scoring === 'a'
      });
      const prizes$ = this.movieQuery.selectAll({
        filterBy: movies => !!movies.festivalPrizes.prizes
      });

      this.moviesBySections$ = combineLatest([latest$, scoring$, prizes$]).pipe(
        map(([latest, scoring, prizes]) => {
          return [
            { title: 'New Films', subline: '', movies: latest },
            {
              title: 'Best Sellers',
              subline: '',
              movies: scoring
            },
            {
              title: 'Awarded Films',
              subline: '',
              movies: prizes
            }
          ];
        })
      );
    }
  }

  public layout(index: number) {
    return index % 2 === 0 ? 'row' : 'row-reverse';
  }

  public alignment(index: number) {
    return index % 2 === 0 ? 'start start' : 'start end';
  }
}
