import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Event } from '../../+state/event.model';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { BehaviorSubject, Subscription, combineLatest, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthQuery } from '@blockframes/auth/+state';

@Component({
  selector: 'event-view-layout',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  animations: [fade],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private _event = new BehaviorSubject<Event>(null);
  event$ = this._event.asObservable();
  invitation: Invitation;
  editMeeting: string;
  accessRoute: string;

  @Input()
  get event() {
    return this._event.getValue();
  }
  set event(event: Event) {
    this._event.next(event);
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private invitationService: InvitationService,
    private location: Location,
    private authQuery: AuthQuery
  ) { }

  async ngOnInit() {

    this.editMeeting = `/c/o/dashboard/event/${this.event.id}/edit`;
    this.accessRoute = `/event/${this.event.id}/r/i/${this.event.type === 'meeting' ? 'lobby' : 'session'}`;

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
    this.location.back();
  }
}
