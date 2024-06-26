// Angular
import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

// Blockframes
import { boolean } from '@blockframes/utils/decorators/decorators';
import { MovieService } from '@blockframes/movie/service';
import { Observable } from 'rxjs';
import { OrganizationService } from '../../service';
import { Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';


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
    private auth: AuthService,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private router: Router,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.toggle$ = this.orgService.isInWishlist(this.movieId);
  }

  public async addToWishlist(event?: Event) {
    event.stopPropagation();
    event.preventDefault();

    if (await this.auth.isSignedInAnonymously()) {
      return this.router.navigate(['/auth/identity']);
    }

    const movie = await this.movieService.getValue(this.movieId);
    const title = movie.title?.international ?? movie.title.original;
    this.orgService.updateWishlist(movie);
    this.snackbar.open(`${title} was successfully added to your Wishlist.`, 'GO TO WISHLIST', { duration: 4000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/c/o/marketplace/wishlist']));
    this.added.emit(this.movieId)
  }

  public async removeFromWishlist(event?: Event) {
    event.stopPropagation();
    event.preventDefault();
    const movie = await this.movieService.getValue(this.movieId);
    const title = movie.title.international;
    this.orgService.updateWishlist(movie);
    this.snackbar.open(`${title} was removed from your Wishlist.`, 'GO TO WISHLIST', { duration: 4000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/c/o/marketplace/wishlist']));
    this.removed.emit(this.movieId)
  }

}
