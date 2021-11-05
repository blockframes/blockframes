import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { ActivatedRoute } from '@angular/router';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Subscription, combineLatest, of } from 'rxjs';
import { catchError, filter, map, switchMap, pluck } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthQuery, AuthService } from '@blockframes/auth/+state';


@Component({
  selector: 'event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  invitation: Invitation;
  editMeeting: string;
  accessRoute: string;
  user$ = this.authQuery.user$;
  event$ = this.route.params.pipe(
    pluck('eventId'),
    switchMap((eventId: string) => this.service.queryDocs(eventId)),
  );

  constructor(
    private route: ActivatedRoute,
    private service: EventService,
    private cdr: ChangeDetectorRef,
    private invitationService: InvitationService,
    private location: Location,
    private authQuery: AuthQuery,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    let emailInvitation: Invitation;
    const anonymousCredentials = this.authService.anonymousCredentials;
    if (anonymousCredentials?.invitationId) {
      emailInvitation = await this.invitationService.getValue(anonymousCredentials?.invitationId);
    }

    this.sub = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$.pipe(catchError(() => of([]))),
    ]).pipe(
      map(([event, invitations]) => {
        this.editMeeting = `/c/o/dashboard/event/${event.id}/edit`;
        this.accessRoute = `/event/${event.id}/r/i/${event.type === 'meeting' ? 'lobby' : 'session'}`;

        switch (event.accessibility) {
          case 'public':
            return undefined;
          case 'invitation-only': {
            const regularInvitation = invitations.find(invitation => invitation.eventId === event.id) ?? null;
            if (regularInvitation) return regularInvitation;
            if (emailInvitation) return emailInvitation;
            return undefined;
          }
          case 'private':
            return invitations.find(invitation => invitation.eventId === event.id) ?? undefined;
        }
      })
    ).subscribe(invitation => {
      this.invitation = invitation
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.authService.updateAnonymousCredentials({ role: undefined, firstName: undefined, lastName: undefined });
    this.location.back();
  }
}
