// Angular
import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDialog } from '@angular/material/dialog';
import { RouterQuery } from '@datorama/akita-ng-router-store';

// RxJs
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Blockframes
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { MovieService, Movie } from '@blockframes/movie/+state'
import { getCurrentApp, App } from '@blockframes/utils/apps';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { EventService } from '@blockframes/event/+state';
import { AuthService } from '@blockframes/auth/+state';

@Component({
  selector: 'layout-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent implements OnInit {
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
    private authQuery: AuthQuery,
    private invitationService: InvitationService,
    private notificationQuery: NotificationQuery,
    private movieService: MovieService,
    private routerQuery: RouterQuery,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.wishlistCount$ = this.orgQuery.selectActive().pipe(
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

  public async confirmLogout() {
    const eventId: string = this.route.snapshot.params.eventId;
    const event = await this.eventService.getValue(eventId);

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: `You are about to leave this ${event.type}.`,
        question: `You might not be able to come back as its access is time-limited.`,
        confirm: 'Leave anyway',
        cancel: 'Stay',
      },
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe(exit => {
      console.log(exit);
      if (exit === true) {
        this.authService.signOut();
      }
    });
  }
}

const filterMovieByAppAccess = (currentApp: App) => (movie: Movie) => {
  return movie.app[currentApp].access;
}
