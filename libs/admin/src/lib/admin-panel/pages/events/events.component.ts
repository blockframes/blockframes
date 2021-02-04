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
    'privacyStatus': 'Privacy status'
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
    'privacyStatus'
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

    const ownerIds = events.map(event => event.ownerId);
    const orgs = await this.orgService.getValue(ownerIds);
    
    this.rows = events.map(event => {
      const row = { ...event } as any;
      const invitations = invites.filter(inv => inv.eventId === event.id);
      row.hostedBy = event.ownerId ? orgs.find(org => org.id === event.ownerId) : undefined;
      row.invited = invitations.length;
      row.confirmed = invitations.filter(i => i.status === 'accepted').length;
      row.pending = invitations.filter(i => i.status === 'pending').length;
      row.privacyStatus = event.isPrivate ? 'private' : 'public';
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
    }))
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }
}
