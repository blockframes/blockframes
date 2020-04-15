import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { MatSidenav, MatSidenavContent } from '@angular/material/sidenav';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Wishlist } from '@blockframes/organization/+state/organization.model';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'layout-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  private sub: Subscription;
  private routerSub: Subscription;

  public user$ = this.authQuery.select('profile');
  public currentWishlist$: Observable<Wishlist>;
  public wishlistCount$: Observable<number>;
  public invitationCount$ = this.invitationQuery.selectCount(invitation => invitation.status === 'pending');
  public notificationCount$ = this.notificationQuery.selectCount();

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(MatSidenavContent) sidenavContent: MatSidenavContent;

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
    private router: Router
  ) {}

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
      // TODO #2502: https://github.com/angular/components/issues/4280
      this.sidenavContent.scrollTo({ top: 0});
      this.sidenav.close();
    })
  }

  ngOnDestroy() {
    if (this.sub) { this.sub.unsubscribe(); }
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  prepareRoute() {
    return this.routerQuery.getValue().state.root.data.animation;
  }
}
