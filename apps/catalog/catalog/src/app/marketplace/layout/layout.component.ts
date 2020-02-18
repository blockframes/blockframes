import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { map } from 'rxjs/operators';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { AuthService, AuthQuery } from '@blockframes/auth';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MatSidenav } from '@angular/material';
import { MarketplaceQuery } from '../+state';

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
  public cartCount$ = this.marketplaceQuery.selectCount();

  @ViewChild('sidenav', { static: false }) sidenav: MatSidenav;

  constructor(
    private marketplaceQuery: MarketplaceQuery,
    private catalogCartQuery: CatalogCartQuery,
    private authService: AuthService,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === WishlistStatus.pending))
      );
    }
    
  ngAfterViewInit() {
    this.sub = this.routerQuery.select('navigationId').subscribe(_ => this.sidenav.close());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public async logout() {
    await this.authService.signOut();
    // TODO: issue#879, navigate with router
    window.location.reload();
  }
}
