import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, HostBinding, OnInit } from '@angular/core';
import { Movie, MovieQuery } from '@blockframes/movie/movie/+state';
import { OrganizationQuery } from '@blockframes/organization';
import { BasketService } from '../../distribution-right/+state/basket.service';

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

  constructor(
    private movieQuery: MovieQuery,
    private organizationQuery: OrganizationQuery,
    private basketService: BasketService
    ) {}

  ngOnInit() {
    const latest$ = this.movieQuery.selectAll({
      filterBy: movies => movies.main.productionYear >= 2018
    });
    const preProduction$ = this.movieQuery.selectAll({
      filterBy: movies => movies.main.status === 'financing'
    });
    const completed$ = this.movieQuery.selectAll({
      filterBy: movies => movies.main.status === 'finished'
    });

    this.moviesBySections$ = combineLatest([latest$, preProduction$, completed$]).pipe(
      map(([latest, preProduction, completed]) => {
        return [
          { title: 'New Films', subline: 'Check out our newest gems!', movies: latest },
          {
            title: 'Pre-Production Films',
            subline: 'Discover the potential of brand new projects',
            movies: preProduction
          },
          {
            title: 'Completed Films',
            subline: 'Complete films for complete success',
            movies: completed
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

  public isAddedToWishlist(movieId: string): Observable<boolean> {
    return this.organizationQuery.select('org').pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(movieId))
      })
    );
  }

  public addToWishlist(movie: Movie) {
    this.basketService.updateWishlist(movie);
  }

}
