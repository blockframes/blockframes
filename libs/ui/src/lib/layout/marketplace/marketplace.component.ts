// Angular
import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CdkScrollable } from '@angular/cdk/overlay';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationService } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MovieService, Movie } from '@blockframes/movie/+state'
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, App } from '@blockframes/utils/apps';

@Component({
  selector: 'layout-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  private activeLinkClickSubscription: Subscription;
  @Input() activeLinkClickEvent: Observable<void>;

  public user$ = this.authQuery.select('profile');
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationQuery.selectCount();
  public invitationCount$ = this.invitationService.myInvitations$.pipe(
    map(invitations => invitations.filter(invitation => invitation.status === 'pending').length),
  )

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable

  constructor(
    private orgQuery: OrganizationQuery,
    private invitationService: InvitationService,
    private notificationQuery: NotificationQuery,
    private authQuery: AuthQuery,
    private movieService: MovieService,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {
    this.activeLinkClickSubscription = this.activeLinkClickEvent.subscribe(() => this.sidenav.close());

    this.wishlistCount$ = this.orgQuery.selectActive().pipe(
      map(org => org.wishlist),
      switchMap(movieIds => this.movieService.getValue(movieIds)),
      map((movies: Movie[]) => movies.filter(filterMovieByAppAccess(getCurrentApp(this.routerQuery))).length)
    );
  }

  ngOnDestroy() {
    this.activeLinkClickSubscription.unsubscribe();
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

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
}
