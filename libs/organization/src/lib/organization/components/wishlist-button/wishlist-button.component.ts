// Angular
import { Component, ChangeDetectionStrategy, Input, Directive, EventEmitter, Output, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { CartService } from '@blockframes/cart/+state/cart.service';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { MovieService } from '@blockframes/movie/+state';
import { CartQuery } from '@blockframes/cart/+state/cart.query';
import { Observable } from 'rxjs';

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
    private movieService: MovieService,
    private cartQuery: CartQuery,
    private cartService: CartService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.toggle$ = this.cartQuery.isAddedToWishlist(this.movieId);
  }

  public async addToWishlist(event?: Event) {
    event.stopPropagation();
    event.preventDefault();
    const movie = await this.movieService.getValue(this.movieId);
    const title = movie.title?.international ?? movie.title.original;
    this.cartService.updateWishlist(movie);
    this.snackbar.open(`${title} has been added to your wishlist.`, 'close', { duration: 2000 });
    this.added.emit(this.movieId)
  }

  public async removeFromWishlist(event?: Event) {
    event.stopPropagation();
    event.preventDefault();
    const movie = await this.movieService.getValue(this.movieId);
    const title = movie.title.international;
    this.cartService.updateWishlist(movie);
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
    this.removed.emit(this.movieId)
  }

}
