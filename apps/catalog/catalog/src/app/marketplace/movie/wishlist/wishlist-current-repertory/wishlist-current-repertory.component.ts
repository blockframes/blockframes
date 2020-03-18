import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  HostBinding
} from '@angular/core';
import { Movie } from '@blockframes/movie';
import { Router, ActivatedRoute } from '@angular/router';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';

@Component({
  selector: 'catalog-wishlist-current-repertory',
  templateUrl: './wishlist-current-repertory.component.html',
  styleUrls: ['./wishlist-current-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistCurrentRepertoryComponent {

  public columnsToDisplay = [
    'movie',
    'director',
    'productionStatus',
    'originCountry',
    'totalRunTime',
    'delete'
  ];
  public dataSource: MatTableDataSource<Movie>;

  @Input()
  set movies(movies: Movie[]) {
    this.dataSource = new MatTableDataSource(movies);
  }

  constructor(
    private router: Router,
    private service: CartService,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    private route: ActivatedRoute
  ) {}

  public async redirectToMovie(movieId: string) {
    this.router.navigate([`../../${movieId}/view`], { relativeTo: this.route });
  }

  public remove(movie: Movie, event: Event) {
    event.stopPropagation();
    this.service.removeMovieFromWishlist(movie.id);
    this.snackbar.open(
      `${movie.main.title.international} has been removed from your selection.`,
      'close',
      { duration: 2000 }
    );
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
  }
}
