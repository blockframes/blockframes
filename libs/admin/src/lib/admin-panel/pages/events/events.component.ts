import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { getValue } from '@blockframes/utils/helpers';
import { EventService } from '@blockframes/event/+state/event.service';

@Component({
  selector: 'admin-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventsComponent implements OnInit {
  public versionColumns = {
    'id': 'Id',
    'title': 'Title',
    'type': 'Type',
    'start': 'Start',
    'end': 'End',
    'edit': 'Edit',
  };

  public initialColumns: string[] = [
    'id',
    'title',
    'type',
    'start',
    'end',
    'edit',
  ];
  public rows: Event[] = [];

  constructor(
    private eventService: EventService,
    private cdRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    const events = await this.eventService.getValue(); // All events
    const promises = events.map(async event => {
      const row = { ...event } as any;
      // Append new data for table display
      row.edit = {
        id: row.id,
        link: `/c/o/admin/panel/event/${row.id}`,
      }
      return row;
    });

    this.rows = await Promise.all(promises);

    this.cdRef.markForCheck();
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
}
