import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Event } from '../../+state/event.model';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { BehaviorSubject, Subscription, combineLatest, of } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';
import { AuthQuery } from '@blockframes/auth/+state';
import { hasAnonymousIdentity } from '@blockframes/utils/event';
import { ActivatedRoute } from '@angular/router';

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
    private authQuery: AuthQuery,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {

    this.editMeeting = `/c/o/dashboard/event/${this.event.id}/edit`;
    this.accessRoute = `/event/${this.event.id}/r/i/${this.event.type === 'meeting' ? 'lobby' : 'session'}`;

    const { i: invitationId } = this.route.snapshot.queryParams;
    let invitation: Invitation;
    if (invitationId) {
      invitation = await this.invitationService.getValue(invitationId as string);
    }


    // @TODO #6756
    this.sub = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$.pipe(catchError(() => of([]))),
      this.authQuery.anonymousCredentials$
    ]).pipe(
      map(([event, invitations, anonymousCredentials]) => {
        switch (event.accessibility) {
          case 'public':
            console.log('no invitation needed');
            return null;
          case 'invitation-only':
            if (hasAnonymousIdentity(anonymousCredentials, event.accessibility) && invitation?.eventId === event.id) {
              return invitation;

            } else {
              // @TODO #6756 bad invitation id => snackbar message?
              return null;
            }
          case 'private':
            return invitations.find(invitation => invitation.eventId === event.id) ?? null;
        }
      })
    ).subscribe(invitation => {
      console.log(invitation);
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
