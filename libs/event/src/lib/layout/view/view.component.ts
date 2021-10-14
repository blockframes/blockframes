import { Component, OnInit, Input, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Event } from '../../+state/event.model';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { fade } from '@blockframes/utils/animations/fade';

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
    private location: Location
  ) { }

  ngOnInit(): void {

    this.editMeeting = `/c/o/dashboard/event/${this.event.id}/edit`;
    this.accessRoute = `/c/o/marketplace/event/${this.event.id}/${this.event.type === 'meeting' ? 'lobby' : 'session'}`;

    // @TODO #6756
    /*this.sub = combineLatest([
      this.event$.pipe(filter(event => !!event)),
      this.invitationService.guestInvitations$
    ]).pipe(
      map(([event, invitations]) => invitations.find(invitation => invitation.eventId === event.id) ?? null)
    ).subscribe(invitation => {
      this.invitation = invitation
      this.cdr.markForCheck();
    });*/
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.back();
  }
}
