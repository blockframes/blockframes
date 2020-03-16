import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Wishlist } from '@blockframes/organization';
import { map } from 'rxjs/operators';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { AuthQuery } from '@blockframes/auth';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'festival-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  private sub: Subscription;
  public user$ = this.authQuery.select('profile');
  public currentWishlist$: Observable<Wishlist>;
  public wishlistCount$: Observable<number>;

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === 'pending'))
    );
    this.wishlistCount$ = this.currentWishlist$.pipe(
      map(wishlist => wishlist.movieIds.length)
    );
  }

  ngAfterViewInit() {
    this.sub = this.routerQuery.select('navigationId').subscribe(_ => this.sidenav.close());
  }

  ngOnDestroy() {
   if(this.sub) { this.sub.unsubscribe(); }
  }
}
