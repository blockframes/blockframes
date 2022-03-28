// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, Inject } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { CdkScrollable } from '@angular/cdk/scrolling';

// RxJs
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { InvitationService } from '@blockframes/invitation/+state';
import { NotificationService } from '@blockframes/notification/+state';
import { OrganizationService } from '@blockframes/organization/+state';
import { Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { AuthService } from '@blockframes/auth/+state';
import { App } from '@blockframes/utils/apps';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'layout-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventComponent implements OnInit {
  public user$ = this.authService.profile$;
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.invitationCount();

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;

  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private movieService: MovieService,
    @Inject(APP) private app: App
  ) {}

  ngOnInit() {
    this.wishlistCount$ = this.orgService.currentOrg$.pipe(
      map((org) => (org?.wishlist ? org.wishlist : [])),
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
}

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
};
