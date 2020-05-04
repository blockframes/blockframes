// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CatalogCartQuery } from '@blockframes/cart/+state/cart.query';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Wishlist } from '@blockframes/organization/+state/organization.model';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';

import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'layout-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  private routerSub: Subscription;

  public user$ = this.authQuery.select('profile');
  public currentWishlist$: Observable<Wishlist>;
  public wishlistCount$: Observable<number>;
  public invitationCount$ = this.invitationQuery.selectCount(invitation => invitation.status === 'pending');
  public notificationCount$ = this.notificationQuery.selectCount();

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkVirtualScrollViewport) scrollViewPort: CdkVirtualScrollViewport;

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === 'pending'))
    );
    this.wishlistCount$ = this.currentWishlist$.pipe(
      map(wishlist => wishlist?.movieIds.length || 0)
    );
  }

  ngAfterViewInit() {
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // https://github.com/angular/components/issues/4280
      this.scrollViewPort.scrollTo({ top: 0 })
      this.sidenav.close();
    })
  }

  ngOnDestroy() {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  prepareRoute() {
    return this.routerQuery.getValue().state.root.data.animation;
  }
}
