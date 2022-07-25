// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, Inject, HostBinding, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { CdkScrollable } from '@angular/cdk/scrolling';

// RxJs
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { InvitationService } from '@blockframes/invitation/service';
import { NotificationService } from '@blockframes/notification/service';
import { OrganizationService } from '@blockframes/organization/service';
import { Movie, App } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'layout-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventComponent implements OnInit, OnDestroy {
  public user$ = this.authService.profile$;
  public wishlistCount$: Observable<number>;
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.invitationCount();
  private resizeSub$: Subscription;
  public showNavigation = true;

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;
  @HostBinding('class.opened') opened = true;

  constructor(
    private orgService: OrganizationService,
    private authService: AuthService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private cdRef: ChangeDetectorRef,
    private movieService: MovieService,
    @Inject(APP) private app: App
  ) { }

  ngOnInit() {
    this.wishlistCount$ = this.orgService.currentOrg$.pipe(
      map((org) => (org?.wishlist ? org.wishlist : [])),
      switchMap((movieIds) => this.movieService.getValue(movieIds)),
      map((movies: Movie[]) => movies.filter(filterMovieByAppAccess(this.app)).length)
    );

    // toggle Navigation desktop/mobile
    if (window.innerWidth <= 599) this.showNavigation = false;
    this.resizeSub$ = fromEvent(window, 'resize').subscribe(_ => {
      const isMobileScreen = window.innerWidth <= 599;
      const isDesktopScreen = window.innerWidth > 599;
      if (
        (isMobileScreen && this.showNavigation) || (isDesktopScreen && !this.showNavigation)
      ) {
        this.toggleNavigation();
        this.cdRef.markForCheck();
      }
    });
  }

  ngOnDestroy() {
    if (this.resizeSub$) this.resizeSub$.unsubscribe();
  }

  scrollToTop() {
    /* When the component is init, the cdk is not ready yet */
    if (this.cdkScrollable) {
      this.cdkScrollable.scrollTo({ top: 0 });
    }
  }

  animationOutlet(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.animation;
  }

  toggleNavigation() {
    this.showNavigation = !this.showNavigation;
  }

  closeNavigation() {
    this.showNavigation = false;
  }
}

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
};
