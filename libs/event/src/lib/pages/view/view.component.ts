import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { Event } from '../../+state/event.model';
import { ActivatedRoute } from '@angular/router';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { BehaviorSubject, Subscription, combineLatest, of } from 'rxjs';
import { catchError, filter, map, switchMap, pluck } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit, OnDestroy { // @TODO #6756 merge with ../layout/view
  private sub: Subscription;
  private eventSub: Subscription;
  invitation: Invitation;
  editMeeting: string;
  accessRoute: string;
  event: Event;
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
    private authQuery: AuthQuery
  ) { }

  async ngOnInit() {
    this.eventSub = this.event$.subscribe(event => {
      this.event = event;
      this.editMeeting = `/c/o/dashboard/event/${event.id}/edit`;
      this.accessRoute = `/event/${event.id}/r/i/${event.type === 'meeting' ? 'lobby' : 'session'}`;
    })

    let emailInvitation: Invitation;
    const anonymousCredentials = this.authQuery.anonymousCredentials;
    if (anonymousCredentials?.invitationId) {
      emailInvitation = await this.invitationService.getValue(this.authQuery.anonymousCredentials?.invitationId);
    }

    this.sub = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$.pipe(catchError(() => of([]))),
    ]).pipe(
      map(([event, invitations]) => {
        switch (event.accessibility) {
          case 'public':
            return undefined;
          case 'invitation-only': {
            const regularInvitation = invitations.find(invitation => invitation.eventId === event.id) ?? null;
            if (regularInvitation) return regularInvitation;
            if (emailInvitation && emailInvitation.accessAllowed) return emailInvitation;
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
    this.eventSub.unsubscribe();
  }

  goBack() {
    this.location.back();
  }
}
