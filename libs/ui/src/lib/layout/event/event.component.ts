// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { RouterQuery } from '@datorama/akita-ng-router-store';

// RxJs
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { InvitationService } from '@blockframes/invitation/+state';
import { NotificationService } from '@blockframes/notification/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { MovieService, Movie } from '@blockframes/movie/+state'
import { getCurrentApp, App } from '@blockframes/utils/apps';
import { AuthService } from '@blockframes/auth/+state';

@Component({
  selector: 'layout-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {
  public user$ = this.authService.user$;
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.myInvitations$.pipe(
    map(invitations => invitations.filter(invitation => invitation.status === 'pending').length),
  )

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable
  
  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private movieService: MovieService,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {
    this.wishlistCount$ = this.orgService.currentOrg$.pipe(
      map(org => org?.wishlist ? org.wishlist : []),
      switchMap(movieIds => this.movieService.getValue(movieIds)),
      map((movies: Movie[]) => movies.filter(filterMovieByAppAccess(getCurrentApp(this.routerQuery))).length)
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

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
}
