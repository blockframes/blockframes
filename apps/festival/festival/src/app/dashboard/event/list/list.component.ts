import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { createEvent, createScreening, Event, EventService } from '@blockframes/event/+state';
import { EventForm } from '@blockframes/event/form/event.form';
import { EventTypes } from '@blockframes/event/+state/event.firestore';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, startWith, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';
import { eventTime } from '@blockframes/event/pipes/event-time.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerService } from '@blockframes/utils/loading/loading.service';
import { MovieService } from '@blockframes/movie/+state';

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
    private orgQuery: OrganizationQuery,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService,
    private route: ActivatedRoute,
    private router: Router,
    private loading: LoadingSpinnerService,
    private movie: MovieService
  ) { }

  async ngOnInit() {
    this.loading.setState(true, 'events');
    this.events$ = combineLatest([
      this.orgQuery.selectActiveId(),
      this.filter.valueChanges.pipe(startWith(this.filter.value))
    ]).pipe(
      switchMap(([orgId, types]) => this.service.queryByType(types, ref => ref.where('ownerOrgId', '==', orgId))),
      tap(events => {
        events.length ?
          this.dynTitle.setPageTitle('My events') :
          this.dynTitle.setPageTitle('My events', 'Empty');
        this.loading.setState(false, 'events');
      }),
    );
    
    const params = this.route.snapshot.queryParams;
    if (params?.request) {
      this.loading.setState(true, 'edit');
      const titleId = params.request as string;
      const orgId = this.orgQuery.getActiveId();
      const title = await this.movie.getValue(titleId);
      if (title?.orgIds.includes(orgId)) {
        const event = createEvent({
          type: 'screening',
          ownerOrgId: this.orgQuery.getActiveId(),
          meta: createScreening({
            titleId: params.request
          })
        });
        const id = await this.service.add(event);
        this.router.navigate([id, 'edit', 'screening'], { relativeTo: this.route });
      } else {
        this.loading.setState(false, 'edit');
        console.error(`Your organisation does not have the rights to create screener for ${titleId}`);
      }
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
