import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { createEvent, createScreening, Event, EventService } from '@blockframes/event/+state';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { OrganizationService } from '@blockframes/organization/+state';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, startWith, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';
import { eventTime } from '@blockframes/event/pipes/event-time.pipe';
import { ActivatedRoute, Router } from '@angular/router';

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
  editDialog: MatDialogRef<unknown>
  events$: Observable<Event[]>;
  viewDate = new Date();

  @ViewChild('editTemplate', { read: TemplateRef }) editTemplate: TemplateRef<unknown>;

  constructor(
    private service: EventService,
    private dialog: MatDialog,
    private orgService: OrganizationService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.events$ = combineLatest([
      this.orgService.org$,
      this.filter.valueChanges.pipe(startWith(this.filter.value))
    ]).pipe(
      switchMap(([org, types]) => this.service.queryByType(types, ref => ref.where('ownerOrgId', '==', org.id))),
      tap(events => {
        events.length ?
          this.dynTitle.setPageTitle('My events') :
          this.dynTitle.setPageTitle('My events', 'Empty');
      }),
    );

    const params = this.route.snapshot.queryParams;
    if (params?.request) {
      const event = createEvent({
        type: 'screening',
        ownerOrgId: this.orgService.org.id,
        meta: createScreening({
          titleId: params.request
        })
      });
      const id = await this.service.add(event);
      this.router.navigate([id, 'edit'], { relativeTo: this.route });
    }
  }

  updateViewDate(date: Date) {
    this.viewDate = date;
    this.cdr.markForCheck();
  }

  hasIncomingEvents(events: Event[] = []) {
    return events.some(e => eventTime(e) !== 'late');
  }

  exportToCalendar(events: Event[] = []) {
    this.agendaService.download(events.filter(e => eventTime(e) !== 'late'));
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
