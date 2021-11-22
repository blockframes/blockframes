import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { combineLatest, of, Observable } from 'rxjs';
import { catchError, filter, switchMap, pluck, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';
import { Event } from '@blockframes/event/+state/event.model'

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
  user$ = this.authQuery.user$;
  event$: Observable<Event>;
  public timerEnded = false;

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private invitationService: InvitationService,
    private location: Location,
    private authQuery: AuthQuery,
    private authService: AuthService
  ) { }

  async ngOnInit() {

    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.service.queryDocs(eventId)),
      tap(event => {
        this.editEvent = `/c/o/dashboard/event/${event.id}/edit`;
      }),
    );

    this.invitation$ = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$.pipe(catchError(() => of([]))),
    ]).pipe(
      switchMap(async ([event, invitations]) => {
        this.accessRoute = `/event/${event.id}/r/i/${event.type === 'meeting' ? 'lobby' : 'session'}`;

        switch (event.accessibility) {
          case 'protected': {
            const regularInvitation = invitations.find(invitation => invitation.eventId === event.id) ?? null;
            if (regularInvitation) return regularInvitation;
            const anonymousCredentials = this.authService.anonymousCredentials;
            if (anonymousCredentials?.invitationId) {
              return this.invitationService.getValue(anonymousCredentials?.invitationId)
            }

            break;
          }
          case 'private':
            return invitations.find(invitation => invitation.eventId === event.id) ?? null;
          default:
            return null;
        }
      })
    );
  }

  goBack() {
    this.authService.updateAnonymousCredentials({ role: undefined, firstName: undefined, lastName: undefined });
    this.location.back();
  }

}
