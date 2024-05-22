import { Component, ChangeDetectionStrategy, HostBinding, ChangeDetectorRef, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { map, pluck, shareReplay, switchMap } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { orderBy, startAt, where } from 'firebase/firestore';

// Blockframes
import { MovieService } from '@blockframes/movie/service';
import { EventService } from '@blockframes/event/service';
import { Screening, Event, App } from '@blockframes/model';
import { InvitationService } from '@blockframes/invitation/service';
import { OrganizationService } from '@blockframes/organization/service';
import { APP } from '@blockframes/utils/routes/utils';
import { RequestAskingPriceComponent } from '../request-asking-price/request-asking-price.component';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'movie-screening',
  templateUrl: 'upcoming-screenings.component.html',
  styleUrls: ['./upcoming-screenings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpcomingScreeningsComponent {
  @HostBinding('class') class = 'dark-contrast-theme';

  public sessions = ['first', 'second', 'third', 'fourth', 'fifth'];

  public sessionCtrl = new UntypedFormControl(0);

  private movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.getValue(movieId))
  );

  public movieId: string = this.route.snapshot.paramMap.get('movieId');

  public ongoingScreenings$: Observable<Event<Screening>[]>;
  public futureScreenings$: Observable<Event<Screening>[]>;

  public orgs$ = this.movie$.pipe(
    switchMap(movie => this.orgService.valueChanges(movie.orgIds)),
    map(orgs => orgs.filter(org => org.appAccess[this.app]))
  );

  public buttonState$: Observable<boolean> = new Observable();
  public requestSent = false;

  constructor(
    private dialog: MatDialog,
    private eventService: EventService,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private snackBar: MatSnackBar,
    @Inject(APP) private app: App
  ) {

    const now = new Date();
    const screenings$ = this.movie$.pipe(
      map(movie => [
        where('isSecret', '==', false),
        where('meta.titleId', '==', movie.id),
        orderBy('end'),
        startAt(now)
      ]),
      switchMap(q => this.eventService.queryByType(['screening'], q)),
      map((screenings: Event<Screening>[]) => screenings.sort(this.sortByDate).slice(0, 5)),
      shareReplay({ refCount: true, bufferSize: 1 })
    );

    this.ongoingScreenings$ = screenings$.pipe(
      map(screenings => screenings.filter(screening => screening.start < now && screening.end > now)),
    );

    this.futureScreenings$ = screenings$.pipe(
      map(screenings => screenings.filter(screening => screening.start > now))
    );

    this.checkInvitationStatus();
  }

  askForInvitation(events: Event[]) {
    const event = events[this.sessionCtrl.value];
    this.invitationService.request(event.ownerOrgId).to('attendEvent', event.id);
    this.snackBar.openFromComponent(SnackbarLinkComponent, {
      data: {
        message: 'You are now registred for this session',
        link: ['/event/', event.id, 'r', 'i'],
        linkName: 'SEE DETAILS'
      },
      duration: 6000
    });
  }

  private sortByDate(a: Event, b: Event): number {
    if (a.start.getTime() < b.start.getTime()) return -1
    if (a.start.getTime() > b.start.getTime()) return 1
    return 0
  }

  checkInvitationStatus() {
    const index = this.sessionCtrl.value;
    this.buttonState$ = combineLatest([
      this.futureScreenings$,
      this.invitationService.guestInvitations$
    ]).pipe(
      map(([screenings, invitations]) => invitations.some(invitation => invitation.eventId === screenings[index].id))
    )
  }

  requestAskingPrice() {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: createModalData({ movieId: this.movieId }, 'large'),
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }
}
