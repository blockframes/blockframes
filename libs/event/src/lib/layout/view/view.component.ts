import { Component, OnInit, Input } from '@angular/core';
import { Event } from '../../+state/event.model';
import { InvitationService, Invitation, createEventInvitation } from '@blockframes/invitation/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { OrganizationService } from '@blockframes/organization/+state';
import { UserService } from '@blockframes/user/+state/user.service';

@Component({
  selector: 'event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class EventViewComponent implements OnInit {
  private _event = new BehaviorSubject<Event>(null);
  event$ = this._event.asObservable();
  invitation$: Observable<Invitation>;

  @Input()
  get event() {
    return this._event.getValue();
  }
  set event(event: Event) {
    this._event.next(event);
  }

  constructor(
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    private orgService: OrganizationService,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    const uid = this.authQuery.userId;
    this.invitation$ = this.event$.pipe(
      switchMap(event => {
        const querFn = ref => ref.where('docId', '==', event.id).where('toUser.uid', '==', uid);
        return this.invitationService.valueChanges(querFn)
      }),
      map(invitations => invitations?.length ? invitations[0] : undefined)
    )
  }

  /** Create an auto-accepted invitation for this event */
  async addToCalendar() {
    if (!this.event.isPrivate) {
      const fromOrg = this.event.type === 'screening'
        ? await this.orgService.getValue(this.event.ownerId)
        : undefined;
      const fromUser = this.event.type === 'meeting'
        ? await this.userService.getValue(this.event.ownerId)
        : undefined;
      const toUser = this.authQuery.user;
      const invitation = createEventInvitation({ docId: this.event.id, status: 'accepted', fromOrg, fromUser, toUser })
      this.invitationService.add(invitation);
    }
  }

  accept(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  refuse(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
  }
}
