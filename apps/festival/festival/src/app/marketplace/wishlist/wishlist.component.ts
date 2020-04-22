import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { CatalogCartQuery } from '@blockframes/cart/+state/cart.query';
import { CartService } from '@blockframes/cart/+state/cart.service';
import { map, filter } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';


@Component({
  selector: 'festival-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistComponent implements OnInit {

  public dataSource$: Observable<MatTableDataSource<Movie>>;
  public columnsToDisplay = [
    'movie',
    'director',
    'productionStatus',
    'originCountry',
    'totalRunTime',
    'delete'
  ];

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private router: Router,
    private service: CartService,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.dataSource$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === 'pending')),
      filter(wishlist => !!wishlist?.movies?.length),
      map(wishlist => new MatTableDataSource(wishlist.movies))
    );
  }


  public async redirectToMovie(movieId: string) {
    this.router.navigate([`../title/${movieId}`], { relativeTo: this.route });
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
