import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnInit,
  HostBinding,
  Inject
} from '@angular/core';
import { Movie } from '@blockframes/movie';
import { Router } from '@angular/router';
import { CartService } from '../../../distribution-deal/+state/cart.service';

@Component({
  selector: 'catalog-wishlist-current-repertory',
  templateUrl: './wishlist-current-repertory.component.html',
  styleUrls: ['./wishlist-current-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistCurrentRepertoryComponent implements OnInit {
  @HostBinding('attr.test-id') testId = 'sentWishlist';

  @Output() sent = new EventEmitter();

  @Input() isCurrent = false;
  @Input() date: Date;

  public columnsToDisplay = [
    'movie',
    'salesAgent',
    'director',
    'productionStatus',
    'originCountry',
    'length'
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
    private analytics: FireAnalytics
  ) {}

  ngOnInit() {
    if (this.isCurrent) {
      this.columnsToDisplay.push('delete');
      this.testId = 'currentWishlist';
    }
  }

  // TODO: issue#1203 use a relative path
  public async redirectToMovie(movieId: string) {
    this.router.navigate([`layout/o/catalog/${movieId}/view`]);
  }

  public remove(movie: Movie, event: Event) {
    event.stopPropagation();
    this.service.removeMovieFromWishlist(movie.id);
    this.snackbar.open(
      `${movie.main.title.international} has been removed from your selection`,
      'close',
      { duration: 2000 }
    );
    this.analytics.event('remove_movie_wishlist', {
      movie: movie.main.title.original
    });
  }
}
