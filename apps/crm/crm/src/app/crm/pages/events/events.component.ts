import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { EventService } from '@blockframes/event/service';
import { InvitationService } from '@blockframes/invitation/service';
import { OrganizationService } from '@blockframes/organization/service';
import { Event, eventsToCrmEvents, crmEventsToExport } from '@blockframes/model';
import { where } from 'firebase/firestore';
import { Router } from '@angular/router';

@Component({
  selector: 'crm-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit {
  public crmEvents = [];
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

    this.crmEvents = eventsToCrmEvents(events, orgs, invites);

    this.eventListLoaded = true;
    this.cdRef.markForCheck();
  }

  public exportTable() {
    const rows = crmEventsToExport(this.crmEvents);
    downloadCsvFromJson(rows, 'events-list');
  }

  goToEdit(event: Event) {
    this.router.navigate([`/c/o/dashboard/crm/event/${event.id}`]);
  }
}
