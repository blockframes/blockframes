import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MatSidenav } from '@angular/material/sidenav';
import { MarketplaceQuery } from '../+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Wishlist } from '@blockframes/organization/organization/+state/organization.model';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private sub: Subscription;
  public user$ = this.authQuery.select('profile');
  public currentWishlist$: Observable<Wishlist>;
  public wishlistCount$: Observable<number>;
  public cartCount$ = this.marketplaceQuery.selectCount();

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private marketplaceQuery: MarketplaceQuery,
    private catalogCartQuery: CatalogCartQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === 'pending'))
    );
    this.wishlistCount$ = this.currentWishlist$.pipe(
      map(wishlist => wishlist ? wishlist.movieIds.length : 0)
    );
  }

  ngAfterViewInit() {
    this.sub = this.routerQuery.select('navigationId').subscribe(_ => this.sidenav.close());
  }

  ngOnDestroy() {
   if(this.sub) { this.sub.unsubscribe(); }
  }
}
