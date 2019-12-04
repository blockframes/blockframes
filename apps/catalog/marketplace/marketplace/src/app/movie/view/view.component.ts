import { map } from 'rxjs/operators';
import { CartService } from './../../distribution-deal/+state/cart.service';
import { Movie, PromotionalElement } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    private cartService: CartService,
    private orgQuery: OrganizationQuery,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {
    this.getMovie();
    this.toggle$ = this.orgQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(this.movieQuery.getActive().id));
      })
    );
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public addToWishlist() {
    const title = this.movieQuery.getActive().main.title.international
    this.cartService.updateWishlist(this.movieQuery.getActive());
    this.snackbar.open(`${title} has been added to your selection.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist() {
    const title = this.movieQuery.getActive().main.title.international
    this.cartService.updateWishlist(this.movieQuery.getActive());
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
  }

  public getBackgroundImage(promotionalElements: PromotionalElement[]) {
    const element = promotionalElements.find(promo => promo.type === 'banner');
    /** TODO(issue#1309) create image directive for background image*/
    return element
    ? `url(${element.media.url})`
    : 'url(/assets/images/banner_movie_view.png)'
  }

  get internationalPremiere() {
    const name = this.movieQuery.getActive().main.title.original;
    const year = this.movieQuery.getActive().main.productionYear;
    return name !== '' ? `${name}, ${year}` : null;
  }

  get color() {
    const color = this.movieQuery.getActive().salesInfo.color;
    return color === 'c' ? 'Color' : 'Black & white';
  }

  get europeanQualification() {
    const europeanQualification = this.movieQuery.getActive().salesInfo.europeanQualification;
    return europeanQualification ? 'Yes' : 'No';
  }
}
