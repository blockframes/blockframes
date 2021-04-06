// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CdkScrollable } from '@angular/cdk/overlay';

// RxJs
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MovieService } from '@blockframes/movie/+state'
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

@Component({
  selector: 'layout-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit {
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
    private movieService: MovieService,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {
    this.wishlistCount$ = this.orgQuery.selectActive().pipe(
      map(org => org.wishlist),
      switchMap(movieIds => this.movieService.getValue(movieIds)),
      map(movies => movies.filter(movie => {
        const currentApp = getCurrentApp(this.routerQuery)
        for (const app in movie.storeConfig.appAccess) {
          if (movie.storeConfig.appAccess[app] && currentApp === app) return true;
          return false;
        }
      }).length)
    );
  }

  scrollToTop() {
    /* When the component is init, the cdk is not ready yet */
    if (this.cdkScrollable) {
      this.cdkScrollable.scrollTo({ top: 0 });
      this.sidenav.close();
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }
}