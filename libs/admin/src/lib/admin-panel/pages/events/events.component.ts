import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { EventService } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { Router } from '@angular/router';
import { OrganizationService, orgName } from '@blockframes/organization/+state';

@Component({
  selector: 'admin-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit {
  public versionColumns = {
    'id': { value: 'Id', disableSort: true },
    'title': 'Title',
    'type': 'Type',
    'start': 'Start',
    'end': 'End',
    'hostedBy': 'Hosted by',
    'invited': 'Number of invitations',
    'confirmed': 'Confirmed',
    'pending': 'Pending',
    'privacyStatus': 'Privacy status',
    'isSecret': 'Hidden on Marketplace'
  };

  public initialColumns: string[] = [
    'id',
    'title',
    'type',
    'start',
    'end',
    'hostedBy',
    'invited',
    'confirmed',
    'pending',
    'privacyStatus',
    'isSecret'
  ];
  public rows: any[] = [];
  public eventListLoaded = false;

  constructor(
    private eventService: EventService,
    private invitationService: InvitationService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private orgService: OrganizationService,
  ) { }

  async ngOnInit() {
    const [events, invites] = await Promise.all([
      this.eventService.getValue(),
      this.invitationService.getValue(ref => ref.where('type', '==', 'attendEvent'))
    ]);

    const ownerOrgIds = events.map(event => event.ownerOrgId);
    const orgs = await this.orgService.getValue(ownerOrgIds);
    
    this.rows = events.map(event => {
      const row = { ...event } as any;
      const invitations = invites.filter(inv => inv.eventId === event.id);
      const org = orgs.find(org => org.id === event.ownerOrgId);
      row.hostedBy = !!org ? orgName(org) : '--';
      row.invited = invitations.length;
      row.confirmed = invitations.filter(i => i.status === 'accepted').length;
      row.pending = invitations.filter(i => i.status === 'pending').length;
      row.privacyStatus = event.isPrivate ? 'private' : 'public';
      row.isSecret = event.isSecret ? 'Yes' : 'No';
      return row;
    })

    this.eventListLoaded = true;
    this.cdRef.markForCheck();
  }

  goToEdit(event) {
    this.router.navigate([`/c/o/admin/panel/event/${event.id}`])
  }

  public filterPredicate(data: any, filter: string) {
    const columnsToFilter = [
      'id',
      'title',
      'type',
      'privacyStatus',
      'isSecret',
      'hostedBy',
    ];
    const dataStr = columnsToFilter.map(c => getValue(data, c)).join();
    return dataStr.toLowerCase().indexOf(filter) !== -1;
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
      'privacy status': i.privacyStatus,
      'hidden on marketplace': i.isSecret
    }))
    downloadCsvFromJson(exportedRows, 'events-list');
  }
}
