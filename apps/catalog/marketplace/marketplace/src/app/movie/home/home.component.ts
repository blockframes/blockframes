import { latest, scoring, prizes } from './movies';
import { Observable, combineLatest, of } from 'rxjs';
import { Movie } from '@blockframes/movie/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit, HostBinding } from '@angular/core';
import { FireQuery } from '@blockframes/utils';
import { map } from 'rxjs/operators';

interface CarouselSection {
  title: string;
  subline: string;
  link: string;
  movies: Partial<Movie>[];
}
@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceHomeComponent {
  @HostBinding('attr.page-id') pageId = 'catalog-marketplace-homepage';

  public moviesBySections$: Observable<CarouselSection[]> = of([
    { title: 'New Films', subline: '', link: '/layout/o/catalog/search', movies: latest },
    {
      title: 'Best Sellers',
      subline: '',
      link: '/layout/o/catalog/search',
      movies: scoring
    },
    {
      title: 'Awarded Films',
      subline: '',
      link: '/layout/o/catalog/search',
      movies: prizes
    }
  ]);

  public layout(index: number) {
    return index%2 === 0? 'row': 'row-reverse';
  }

  public alignment(index: number) {
    return index%2 === 0? 'start start': 'start end';
  }
}

// Code stashed away for Toronto

/** Observable to fetch all movies from the store
  public moviesBySections$: Observable<CarouselSection[]>;

 /*  constructor(private fireQuery: FireQuery) {}

  ngOnInit() {
    // TODO #721: look for query when data query model is done.
    const latest$ = this.fireQuery
      .collection<Movie>('movies', ref => ref.limit(5).where('main.productionYear', '>=', 2018))
      .valueChanges();
    const scoring$ = this.fireQuery
      .collection<Movie>('movies', ref => ref.limit(5).where('salesInfo.scoring', '==', 'a'))
      .valueChanges();
    const prizes$ = this.fireQuery.collection<Movie>('movies').valueChanges();
    this.moviesBySections$ = combineLatest([latest$, scoring$, prizes$]).pipe(
      map(([latest, scoring, prizes]) => {
        return [
          { title: 'New Films', subline: '', link: '#', movies: latest },
          {
            title: 'Best Sellers',
            subline: '',
            link: '#',
            movies: scoring
          },
          {
            title: 'Awarded Films',
            subline: '',
            link: '#',
            movies: prizes
          }
        ];
      })
    );
  }

  public layout(index: number) {
    return index%2 === 0? 'row': 'row-reverse';
  }

  public alignment(index: number) {
    return index%2 === 0? 'start start': 'start end';
  }
}
 */
