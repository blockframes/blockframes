import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Event, EventService } from '@blockframes/event/+state';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, startWith } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

const typesLabel = {
  screening: 'Screenings',
  meeting: 'Meetings'
}

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit {
  typesLabel = typesLabel;
  types: EventTypes[] = ['screening', 'meeting'];
  filter = new FormControl(this.types);
  editDialog: MatDialogRef<any>
  events$: Observable<Event[]>;
  viewDate = new Date();

  @ViewChild('editTemplate', { read: TemplateRef }) editTemplate: TemplateRef<any>;
  
  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private orgQuery: OrganizationQuery,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.events$ = combineLatest([
      this.orgQuery.selectActiveId(),
      this.filter.valueChanges.pipe(startWith(this.filter.value))
    ]).pipe(
      switchMap(([orgId, types]) => this.service.queryByType(types, ref => ref.where('ownerId', '==', orgId))),
    );
  }

  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

  /**
   * Open a dialog to update the event
   * @param data The event to update
   */
  async edit(data: Event) {
    this.editDialog = this.dialog.open(this.editTemplate, { data: new EventForm(data) });
    this.editDialog.afterClosed().pipe(
      filter(event => !!event)
    ).subscribe(async event => this.service.update(event));
  }

  remove(event: Event) {
    this.service.remove(event.id);
  }
}
