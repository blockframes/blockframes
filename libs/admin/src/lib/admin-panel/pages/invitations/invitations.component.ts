import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { OrganizationService, Organization, orgName } from '@blockframes/organization/+state';
import { EventService, Event } from '@blockframes/event/+state/';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';

export interface InvitationDetailed extends Invitation {
  org: Organization,
  event: Event,
};

@Component({
  selector: 'admin-invitations',
  templateUrl: './invitations.component.html',
  styleUrls: ['./invitations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationsComponent implements OnInit {

  public invitations: InvitationDetailed[];
  
  public columns : string[] = [
    'id',
    'org.denomination',
    'event.title',
    'event.id',
    'date',
    'toUser.firstName',
    'toUser.lastName',
    'mode',
    'status',
    'toUser.email',
  ];

  constructor(
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private eventService: EventService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const invitations = await this.invitationService.getValue(ref => ref.where('type', '==', 'attendEvent'));

    const orgs = invitations.map(async i => {
      const invitation: InvitationDetailed = { ...i } as InvitationDetailed;
      invitation.org = await this.orgService.getValue(invitation.fromOrg.id);
      invitation.event = await this.eventService.getValue(invitation.docId);
      return invitation;
    })

    this.invitations = await Promise.all(orgs);
    this.cdRef.markForCheck();
  }

  public exportTable() {
    const exportedRows = this.invitations.map(i => ({
      id : i.id,
      org: orgName(i.org.denomination),
      event: i.event.title,
      date: i.date,
      guest: `${i.toUser.firstName} ${i.toUser.lastName}`,
      email: i.toUser.email,
      mode: i.mode,
      status: i.status,
    }))
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }

}
