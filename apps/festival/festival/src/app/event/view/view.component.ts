import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { combineLatest, of, Observable, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, pluck, tap, startWith } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthService } from '@blockframes/auth/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import { Event, Invitation } from '@blockframes/model';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

@Component({
  selector: 'festival-event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit {
  invitation$: Observable<Invitation>;
  editEvent: string;
  accessRoute: string;
  user$ = this.authService.profile$;
  event$: Observable<Event>;
  requestSent = false;
  ltMd$ = this.breakpointsService.ltMd;
  private statusChanged = new BehaviorSubject(false);
  public timerEnded = false;
  private preventBrowserEvent = false;

  public eventRoomAccess = {
    meeting: 'Meeting',
    screening: 'Screening',
    slate: 'Screening' // for Buyers point of view Slate event remains a Screening
  };

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
    private breakpointsService: BreakpointsService,
    private location: Location,
    private authService: AuthService,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    if (!this.preventBrowserEvent) {
      this.goBack();
    }
  }

  async ngOnInit() {

    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
      tap(event => {
        this.editEvent = `/c/o/dashboard/event/${event.id}/edit`;
        this.dynTitle.setPageTitle(event.title);
      }),
    );

    this.invitation$ = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$.pipe(startWith([]), catchError(() => of([]))),
      this.statusChanged
    ]).pipe(
      switchMap(async ([event, invitations]) => {
        this.accessRoute = `/event/${event.id}/r/i/${event.type === 'meeting' ? 'lobby' : 'session'}`;

        switch (event.accessibility) {
          case 'protected': {
            const regularInvitation = invitations.find(invitation => invitation.eventId === event.id);
            if (regularInvitation) return regularInvitation;
            const anonymousCredentials = this.authService.anonymousCredentials;
            if (anonymousCredentials?.invitationId) {
              return this.invitationService.getValue(anonymousCredentials?.invitationId);
            }

            return null;
          }
          default:
            return invitations.find(invitation => invitation.eventId === event.id) ?? null;
        }
      })
    );
  }

  goBack() {
    this.preventBrowserEvent = true;
    this.authService.updateAnonymousCredentials({ role: undefined, firstName: undefined, lastName: undefined });
    this.location.back();
  }

  reloadInvitation() {
    this.statusChanged.next(true);
  }

  requestAskingPrice(movieId: string) {
    const ref = this.dialog.open(RequestAskingPriceComponent, {
      data: createModalData({ movieId }, 'large'),
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }
}
