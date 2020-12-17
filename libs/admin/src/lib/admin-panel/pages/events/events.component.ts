import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue, downloadCsvFromJson } from '@blockframes/utils/helpers';
import { EventService, Event } from '@blockframes/event/+state';
import { InvitationService } from '@blockframes/invitation/+state';
import { Router } from '@angular/router';

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
    'attendees': 'Number of attendees',
    'confirmed': 'Confirmed',
    'pending': 'Pending'
  };

  public initialColumns: string[] = [
    'id',
    'title',
    'type',
    'start',
    'end',
    'attendees',
    'confirmed',
    'pending'
  ];
  public rows: any[] = [];
  public eventListLoaded = false;

  constructor(
    private eventService: EventService,
    private invitationService: InvitationService,
    private cdRef: ChangeDetectorRef,
    private router: Router
  ) { }

  async ngOnInit() {
    const events = await this.eventService.getValue(); // All events
    const promises = events.map(async event => {
      const row = { ...event } as any;
      // Append new data for table display
      const invitations = await this.invitationService.getValue(ref => ref.where('docId', '==', row.id));
      row.attendees = invitations.length;
      row.confirmed = invitations.filter(i => i.status === 'accepted').length;
      row.pending = invitations.filter(i => i.status === 'pending').length;

      return row;
    });

    this.rows = await Promise.all(promises);
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
      'attendees': i.attendees,
      'confirmed': i.confirmed,
      'pending': i.pending,
      'privacy status': i.isPrivate ? 'private' : 'public',
    }))
    downloadCsvFromJson(exportedRows, 'invitations-list');
  }
}
