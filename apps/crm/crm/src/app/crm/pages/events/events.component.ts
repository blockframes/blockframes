import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/+state';
import { toLabel } from '@blockframes/utils/pipes';
import { orgName } from '@blockframes/model';
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
    private router: Router,
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

  goToEdit(event) {
    this.router.navigate([`/c/o/dashboard/crm/event/${event.id}`])
  }

  public exportTable() {
    const exportedRows = this.rows.map(i => ({
      'event id': i.id,
      'event name': i.title,
      'event type': i.type,
      'start date': i.start,
      'end date': i.end,
      'hosted by': i.hostedBy ? orgName(i.hostedBy, 'full') : '--',
      'invited': i.invited,
      'confirmed': i.confirmed,
      'pending': i.pending,
      'accessibility': i.accessibility,
      'hidden on marketplace': i.isSecret
    }))
    downloadCsvFromJson(exportedRows, 'events-list');
  }
}
