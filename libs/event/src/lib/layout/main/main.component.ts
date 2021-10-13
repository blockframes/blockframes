import { CdkScrollable } from '@angular/cdk/scrolling';
import { Component, ChangeDetectionStrategy, ViewChild, OnInit } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { AuthQuery } from '@blockframes/auth/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { Movie, MovieService } from '@blockframes/movie/+state';
import { NotificationQuery } from '@blockframes/notification/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { App, getCurrentApp } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
@Component({
  selector: 'event-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainComponent implements OnInit {
  public user$ = this.authQuery.select('profile');
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationQuery.selectCount();
  public invitationCount$ = this.invitationService.myInvitations$.pipe(
    map(invitations => invitations.filter(invitation => invitation.status === 'pending').length),
  )

  constructor(
    private orgQuery: OrganizationQuery,
    private authQuery: AuthQuery,
    private invitationService: InvitationService,
    private notificationQuery: NotificationQuery,
    private movieService: MovieService,
    private routerQuery: RouterQuery
  ) { }


  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  ngOnInit() {
    this.wishlistCount$ = this.orgQuery.selectActive().pipe(
      map(org => org?.wishlist ? org.wishlist : []),
      switchMap(movieIds => this.movieService.getValue(movieIds)),
      map((movies: Movie[]) => movies.filter(filterMovieByAppAccess(getCurrentApp(this.routerQuery))).length)
    );
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  scrollToTop() {
    /* When the component is init, the cdk is not ready yet */
    if (this.cdkScrollable) {
      this.cdkScrollable.scrollTo({ top: 0 });
      this.sidenav.close();
    }
  }
}

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
}