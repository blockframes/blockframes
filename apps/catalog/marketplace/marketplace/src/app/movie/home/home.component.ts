import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { Movie, MovieQuery } from '@blockframes/movie/movie/+state';
import { getLabelByCode, Scope } from '@blockframes/movie/movie/static-model/staticModels';

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
          { title: 'New Films', subline: 'Check out our newest gems!', movies: latest },
          {
            title: 'In Production Films',
            subline: 'Discover the potential of projects still in production',
            movies: scoring
          },
          {
            title: 'Completed Films',
            subline: 'Complete films for complete success',
            movies: prizes
          }
        ];
      })
    );
  }

  public layout(index: number) {
    return index % 2 === 0 ? 'row' : 'row-reverse';
  }

  public alignment(index: number) {
    return index % 2 === 0 ? 'start start' : 'start end';
  }

  public getLabel(slug: string, scope: Scope) {
    return getLabelByCode(scope, slug);
  }
}
