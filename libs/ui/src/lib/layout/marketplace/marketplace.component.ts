// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild, Inject, HostBinding, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav } from '@angular/material/sidenav';
import { CdkScrollable } from '@angular/cdk/overlay';

// RxJs
import { fromEvent, Observable, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { InvitationService } from '@blockframes/invitation/service';
import { NotificationService } from '@blockframes/notification/service';
import { OrganizationService } from '@blockframes/organization/service';
import { Movie, App } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { AuthService } from '@blockframes/auth/service';
import { APP } from '@blockframes/utils/routes/utils';

@Component({
  selector: 'layout-marketplace',
  templateUrl: './marketplace.component.html',
  styleUrls: ['./marketplace.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketplaceComponent implements OnInit, OnDestroy {
  public user$ = this.authService.profile$;
  public wishlistCount$: Observable<number>;
  private resizeSub$: Subscription;
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.invitationCount();
  public showNavigation = true;

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  @ViewChild(CdkScrollable) cdkScrollable: CdkScrollable;
  @HostBinding('class.opened') opened = true;

  constructor(
    private orgService: OrganizationService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private movieService: MovieService,
    private cdRef: ChangeDetectorRef,
    @Inject(APP) private app: App
  ) { }

  ngOnInit() {
    this.wishlistCount$ = this.orgService.currentOrg$.pipe(
      map((org) => org?.wishlist || []),
      switchMap((movieIds) => this.movieService.getValue(movieIds)),
      map((movies: Movie[]) => movies.filter(filterMovieByAppAccess(this.app)).length)
    );

    // toggle Navigation desktop/mobile
    this.resizeSub$ = fromEvent(window, 'resize').subscribe(_ => {
      if (window.innerWidth <= 599 && this.showNavigation || window.innerWidth > 599 && !this.showNavigation) {
        this.toggleNavigation();
        this.cdRef.markForCheck();
      }
    })
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
}

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
};
