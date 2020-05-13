import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Event } from '../../+state/event.model';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'event-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewComponent {
  private _event: Event;
  invitations$: Observable<Invitation[]>

  @Input() 
  set event(event: Event) {
    if (event) {
      this._event = event;
      this.invitations$ = this.invitationService.queryGuest(event.id, 'attendEvent');
    }
  }
  get event() {
    return this._event;
  }

  constructor(
    private orgQuery: OrganizationQuery,
    private invitationService: InvitationService
  ) { }


}
