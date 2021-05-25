// Angular
import { Component, ChangeDetectionStrategy, Input, Directive, EventEmitter, Output, OnInit, HostBinding } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { MovieService } from '@blockframes/movie/+state';
import { Observable } from 'rxjs';
import { OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';

@Directive({
  selector: 'wishlist-add-text [wishlistAddText]',
})
export class WishlistAddTextDirective {
  @HostBinding('host') class = 'wishlist-add-text';
}

@Directive({
  selector: 'wishlist-remove-text [wishlistRemoveText]',
})
export class WishlistRemoveTextDirective {
  @HostBinding('host') class = 'wishlist-remove-text';
}

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
    private orgQuery: OrganizationQuery,
    private orgService: OrganizationService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.toggle$ = this.orgQuery.isAddedToWishlist(this.movieId);
  }

  public async addToWishlist(event?: Event) {
    event.stopPropagation();
    event.preventDefault();
    const movie = await this.movieService.getValue(this.movieId);
    const title = movie.title?.international ?? movie.title.original;
    this.orgService.updateWishlist(movie);
    this.snackbar.open(`${title} has been added to your wishlist.`, 'close', { duration: 2000 });
    this.added.emit(this.movieId)
  }

  public async removeFromWishlist(event?: Event) {
    event.stopPropagation();
    event.preventDefault();
    const movie = await this.movieService.getValue(this.movieId);
    const title = movie.title.international;
    this.orgService.updateWishlist(movie);
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
    this.removed.emit(this.movieId)
  }

}
