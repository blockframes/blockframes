import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { EventService } from '@blockframes/event/service';
import { InvitationService } from '@blockframes/invitation/service';
import { OrganizationService } from '@blockframes/organization/service';
import { orgName, toLabel } from '@blockframes/model';
import { where } from 'firebase/firestore';

@Component({
  selector: 'crm-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit {
  public rows = [];
  public eventListLoaded = false;

  constructor(
    private eventService: EventService,
    private invitationService: InvitationService,
    private cdRef: ChangeDetectorRef,
    private orgService: OrganizationService
  ) { }

  async ngOnInit() {
    const [events, invites] = await Promise.all([
      this.eventService.getValue(),
      this.invitationService.getValue([where('type', '==', 'attendEvent')])
    ]);

    const ownerOrgIds = events.map(event => event.ownerOrgId);
    const orgs = await this.orgService.getValue(ownerOrgIds);

    this.rows = events.map(event => {
      const row = { ...event } as any;
      const invitations = invites.filter(inv => inv.eventId === event.id);
      const org = orgs.find(o => o.id === event.ownerOrgId);
      row.hostedBy = org ? orgName(org) : '--';
      row.hostId = org ? org.id : '--';
      row.invited = invitations.length;
      row.confirmed = invitations.filter(i => i.status === 'accepted').length;
      row.pending = invitations.filter(i => i.status === 'pending').length;
      row.accessibility = toLabel(event.accessibility, 'accessibility');
      row.isSecret = event.isSecret ? 'Yes' : 'No';
      return row;
    })

    this.eventListLoaded = true;
    this.cdRef.markForCheck();
  }

  public exportTable() {
    const exportedRows = this.rows.map(i => ({
      'event id': i.id,
      'event name': i.title,
      'event type': i.type,
      'start date': i.start,
      'end date': i.end,
      'hosted by': i.hostedBy,
      'host id': i.ownerOrgId,
      'invited': i.invited,
      'confirmed': i.confirmed,
      'pending': i.pending,
      'accessibility': i.accessibility,
      'hidden on marketplace': i.isSecret
    }))
    downloadCsvFromJson(exportedRows, 'events-list');
  }
}
