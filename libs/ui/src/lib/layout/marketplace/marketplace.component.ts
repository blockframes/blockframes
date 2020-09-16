// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';

import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CdkScrollable } from '@angular/cdk/overlay';
import { OrganizationQuery } from '@blockframes/organization/+state';

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
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationQuery.selectCount();
  public invitationCount$ = this.invitationQuery.toMe(invitation => invitation.status === 'pending').pipe(
    map(invitations => invitations.length)
  );

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable

  constructor(
    private orgQuery: OrganizationQuery,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
    private authQuery: AuthQuery,
    private router: Router,
  ) { }

  ngOnInit() {
    this.wishlistCount$ = this.orgQuery.selectActive().pipe(
      map(org => org.wishlist.find(wishlist => wishlist.status === 'pending')),
      map(wishlist => wishlist?.movieIds.length || 0)
    );
  }

  ngAfterViewInit() {
    // https://github.com/angular/components/issues/4280
    this.routerSub = this.router.events.pipe(
     filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.cdkScrollable.scrollTo({top: 0});
      this.sidenav.close();
    });
  }

  ngOnDestroy() {
    if (this.routerSub) { this.routerSub.unsubscribe(); }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}
