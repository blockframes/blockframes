import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { Event } from '@blockframes/event/+state/event.model';
import { InvitationService, Invitation } from '@blockframes/invitation/+state';
import { Observable } from 'rxjs';
import { Organization, OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'crm-event-info',
  templateUrl: './event-info.component.html',
  styleUrls: ['./event-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventInfoComponent implements OnInit {
  private _event: Event;
  invitations$: Observable<Invitation[]>
  public org: Organization;

  @Input() 
  set event(event: Event) {
    if (event) {
      this._event = event;
      this.invitations$ = this.invitationService.valueChanges(ref => ref.where('type', '==', 'attendEvent').where('eventId', '==', event.id));
    }
  }
  get event() {
    return this._event;
  }

  constructor(
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    ) { }

  async ngOnInit() {
    this.org = await this.orgService.getValue(this.event.ownerOrgId);
  }
}
