import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { CatalogCartQuery } from '@blockframes/cart/+state/cart.query';
import { CartService } from '@blockframes/cart/+state/cart.service';
import { map, filter, tap } from 'rxjs/operators';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { Subscription } from 'rxjs';


@Component({
  selector: 'festival-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss'],
  // The table needs to be updated when user deletes a movie
  changeDetection: ChangeDetectionStrategy.Default
})
export class WishlistComponent implements OnInit, OnDestroy {

  public dataSource: MatTableDataSource<Movie>;
  public hasWishlist: boolean;
  public columnsToDisplay = [
    'movie',
    'director',
    'productionStatus',
    'originCountry',
    'totalRunTime',
    'delete'
  ];

  private sub: Subscription

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private router: Router,
    private service: CartService,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sub = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === 'pending')),
      tap(wishlist => this.hasWishlist = !!wishlist?.movieIds.length),
      filter(wishlist => !!wishlist?.movies?.length)
    ).subscribe(wishlist => {
      this.dataSource = new MatTableDataSource(wishlist.movies)
      this.cdr.markForCheck();
    });
  }

  public async redirectToMovie(movieId: string) {
    this.router.navigate([`../title/${movieId}`], { relativeTo: this.route });
  }

  public remove(movie: Movie, event: Event) {
    event.stopPropagation();
    this.service.removeMovieFromWishlist(movie.id);
    this.snackbar.open(
      `${movie.title.international} has been removed from your selection.`,
      'close',
      { duration: 2000 }
    );
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.title.original
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
