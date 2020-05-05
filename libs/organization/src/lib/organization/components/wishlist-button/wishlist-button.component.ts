// Angular
import { Component, OnInit, ChangeDetectionStrategy, Input, Directive, EventEmitter, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Blockframes
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { CartService } from '@blockframes/cart/+state/cart.service';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Directive({
  selector: 'wishlist-add-text [wishlistAddText]',
  host: { class: 'wishlist-add-text' }
})
// tslint:disable-next-line: directive-class-suffix
export class WishlistAddText { }

@Directive({
  selector: 'wishlist-remove-text [wishlistRemoveText]',
  host: { class: 'wishlist-remove-text' }
})
// tslint:disable-next-line: directive-class-suffix
export class WishlistRemoveText { }

@Component({
  selector: '[movieId] wishlist-button',
  templateUrl: './wishlist-button.component.html',
  styleUrls: ['./wishlist-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistButtonComponent implements OnInit {

  toggle$: Observable<boolean>;

  @Input() movieId: string;

  @Input() @boolean small: boolean;

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
