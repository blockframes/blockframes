import { Component, OnInit, ChangeDetectionStrategy, HostListener, ChangeDetectorRef } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { combineLatest, of, Observable, BehaviorSubject } from 'rxjs';
import { catchError, filter, switchMap, pluck, tap, startWith, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthService } from '@blockframes/auth/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatDialog } from '@angular/material/dialog';
import { RequestAskingPriceComponent } from '@blockframes/movie/components/request-asking-price/request-asking-price.component';
import { Event, Invitation, Movie, Slate } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/+state/movie.service';

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
  slateTitles$: Observable<Movie[]>;
  requestSent = false;
  private statusChanged = new BehaviorSubject(false);
  public timerEnded = false;
  private preventBrowserEvent = false;

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
    private location: Location,
    private authService: AuthService,
    private movieService: MovieService,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
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
    
    this.slateTitles$ = this.event$.pipe(
      map(event => event as Event<Slate>),
      switchMap(event => this.movieService.valueChanges(event.meta.titles)),
    )
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
      data: { movieId },
      maxHeight: '80vh',
      maxWidth: '650px',
      autoFocus: false
    });
    ref.afterClosed().subscribe(isSent => {
      this.requestSent = !!isSent;
      this.cdr.markForCheck();
    });
  }
}
