import { map } from 'rxjs/operators';
import { BasketService } from './../../distribution-right/+state/basket.service';
import { Movie } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MarketplaceMovieViewComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-movie-view';
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  // Flag to indicate which icon and message to show
  public toggle$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private basketService: BasketService,
    private orgQuery: OrganizationQuery
  ) {}

  ngOnInit() {
    this.getMovie();
    this.toggle$ = this.orgQuery.select('org').pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(this.movieQuery.getActive().id));
      })
    );
    this.movie$.subscribe(d => console.log(d))
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public addToWishlist() {
    this.basketService.updateWishlist(this.movieQuery.getActive());
  }

  get internationalPremiere() {
    const name = this.movieQuery.getActive().main.title.original;
    const year = this.movieQuery.getActive().main.productionYear;
    return name !== '' ? `${name}, ${year}` : null;
  }

  get color() {
    const color = this.movieQuery.getActive().salesInfo.color;
    return color === 'c' ? 'color' : 'black & white';
  }

  get europeanQualification() {
    const europeanQualification = this.movieQuery.getActive().salesInfo.europeanQualification;
    return europeanQualification ? 'Yes' : 'No';
  }
}
