// Angular
import { Component, OnInit, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Blockframes
import { CartService } from '@blockframes/cart/+state/cart.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';

@Component({
  selector: '[movieId] wishlist-button',
  templateUrl: './wishlist-button.component.html',
  styleUrls: ['./wishlist-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistButtonComponent implements OnInit {

  toggle$: Observable<boolean>;

  @Input() movieId: string;

  _small: boolean;
  @Input()
  get small() {
    return this._small;
  }
  set small(isSmall: boolean) {
    this._small = coerceBooleanProperty(isSmall);
  }

  @Output() removed = new EventEmitter<string>()
  @Output() added = new EventEmitter<string>()

  constructor(
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private cartService: CartService,
    private analytics: FireAnalytics,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.toggle$ = this.orgQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(this.movieId));
      })
    );
  }


  public addToWishlist() {
    const movie = this.movieQuery.getEntity(this.movieId);
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('addedToWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been added to your wishlist.`, 'close', { duration: 2000 });
    this.added.emit(this.movieId)
  }

  public removeFromWishlist() {
    const movie = this.movieQuery.getEntity(this.movieId);
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
    this.removed.emit(this.movieId)
  }

}
