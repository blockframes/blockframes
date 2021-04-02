import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { CartService } from '@blockframes/cart/+state/cart.service';
import { switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MovieService } from '@blockframes/movie/+state';


@Component({
  selector: 'marketplace-wishlist',
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
    'runningTime',
    'delete'
  ];

  private sub: Subscription;
  public isDataLoaded = false;

  constructor(
    private router: Router,
    private service: CartService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private orgQuery: OrganizationQuery,
    private movieService: MovieService
  ) { }

  ngOnInit() {
    this.sub = this.orgQuery.selectActive().pipe(
      switchMap(org => this.movieService.valueChanges(org?.wishlist || []))
    ).subscribe(allMovies => {
      // valueChanges returns all documents even if they don't exist - created issue for this on akita-ng-fire https://github.com/dappsnation/akita-ng-fire/issues/138
      const movies = allMovies.filter(movie => !!movie);
      this.hasWishlist = !!movies.length;
      this.hasWishlist ?
        this.dynTitle.setPageTitle('Wishlist') :
        this.dynTitle.setPageTitle('Wishlist', 'Empty');
      this.dataSource = new MatTableDataSource(movies);
      this.isDataLoaded = true;
      this.cdr.markForCheck();
    });
  }

  public async redirectToMovie(movieId: string) {
    this.router.navigate(['../title', movieId], { relativeTo: this.route });
  }

  public remove(movie: Movie, event: Event) {
    event.stopPropagation();
    this.service.updateWishlist(movie);
    const title = movie.title.international;
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
