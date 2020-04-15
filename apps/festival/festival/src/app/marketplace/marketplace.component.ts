import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { CatalogCartQuery } from '@blockframes/cart/+state/cart.query';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Wishlist } from '@blockframes/organization/+state/organization.model';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state/notification.query';

@Component({
  selector: 'festival-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit, AfterViewInit, OnDestroy {
  private sub: Subscription;
  public user$ = this.authQuery.select('profile');
  public currentWishlist$: Observable<Wishlist>;
  public wishlistCount$: Observable<number>;
  public invitationCount$ = this.invitationQuery.selectCount(invitation => invitation.status === 'pending');
  public notificationCount$ = this.notificationQuery.selectCount();

  @ViewChild('sidenav') sidenav: MatSidenav;

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
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
    this.sub = this.routerQuery.select('navigationId').subscribe(_ => this.sidenav.close());
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  prepareRoute() {
    return this.routerQuery.getValue().state.root.data.animation;
  }
}
