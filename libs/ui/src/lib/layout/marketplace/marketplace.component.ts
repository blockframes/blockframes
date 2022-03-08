// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, Inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CdkScrollable } from '@angular/cdk/overlay';

// RxJs
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationService } from '@blockframes/invitation/+state';
import { NotificationService } from '@blockframes/notification/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { App } from '@blockframes/utils/apps';
import { AuthService } from '@blockframes/auth/+state';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'layout-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceComponent implements OnInit {
  public user$ = this.authService.profile$;
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.myInvitations$.pipe(
    map((invitations) => invitations.filter((invitation) => invitation.status === 'pending').length)
  );

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  constructor(
    private orgService: OrganizationService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private movieService: MovieService,
    private router: Router,
    @Inject(APP) private app: App
  ) {}

  ngOnInit() {
    this.wishlistCount$ = this.orgService.currentOrg$.pipe(
      map((org) => org?.wishlist || []),
      switchMap((movieIds) => this.movieService.getValue(movieIds)),
      map((movies: Movie[]) => movies.filter(filterMovieByAppAccess(this.app)).length)
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

  onAppLogoClick() {
    if (this.router.url === '/c/o/marketplace/home') {
      this.cdkScrollable.scrollTo({ top: 0 });
    } else {
      this.router.navigate(['/c/o/marketplace/home']);
    }
  }
}

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
};
