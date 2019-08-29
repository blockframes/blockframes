import { Observable, combineLatest } from 'rxjs';
import { Movie } from '@blockframes/movie/movie/+state';
import { Component, ChangeDetectionStrategy, OnInit, HostBinding } from '@angular/core';
import { FireQuery } from '@blockframes/utils';
import { map } from 'rxjs/operators';

interface CarouselSection {
  title: string;
  subline: string;
  link: string;
  movies: Movie[];
}
@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogMarketplaceHomeComponent implements OnInit {

  /** Observable to fetch all movies from the store */
  public moviesBySections$: Observable<CarouselSection[]>;

  constructor(private fireQuery: FireQuery) {}

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
          { title: 'New Films', subline: 'Lorem Ipsum', link: '#', movies: latest },
          {
            title: 'Best Sellers',
            subline: 'Lorem Ipsum',
            link: '#',
            movies: scoring
          },
          {
            title: 'Awarded Films',
            subline: 'Lorem Ipsum',
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
