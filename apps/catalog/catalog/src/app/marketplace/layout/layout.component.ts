import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { CatalogCartQuery } from '@blockframes/cart/+state/cart.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { MarketplaceQuery } from '../+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Wishlist } from '@blockframes/organization/+state/organization.model';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private sub: Subscription;
  private routerSub: Subscription;
  public user$ = this.authQuery.select('profile');
  public currentWishlist$: Observable<Wishlist>;
  public wishlistCount$: Observable<number>;
  public cartCount$ = this.marketplaceQuery.selectCount();

  @ViewChild('sidenav') sidenav: MatSidenav;
  @ViewChild('content') sidenavContent: MatSidenavContent;

  constructor(
    private marketplaceQuery: MarketplaceQuery,
    private catalogCartQuery: CatalogCartQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === 'pending'))
    );
    this.wishlistCount$ = this.currentWishlist$.pipe(
      map(wishlist => wishlist?.movieIds?.length || 0)
    );
  }

  ngAfterViewInit() {
    this.sub = this.routerQuery.select('navigationId').subscribe(_ => this.sidenav.close());
    // https://github.com/angular/components/issues/4280
    // TODO #2502
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sidenavContent.scrollTo({top: 0});
      })
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }
}
