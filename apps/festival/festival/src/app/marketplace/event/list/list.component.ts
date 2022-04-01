import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { combineLatest, Observable } from 'rxjs';
import { slideDown } from '@blockframes/utils/animations/fade';
import { map, shareReplay, startWith, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FormList } from '@blockframes/utils/form';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';
import { AgendaService } from '@blockframes/utils/agenda/agenda.service';
import { Event, Screening } from '@blockframes/shared/model';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit {
  public events$: Observable<Event<Screening>[]>;
  public searchForm = FormList.factory<AlgoliaOrganization>([]);

  trackById = (i: number, doc: { id: string }) => doc.id;

  constructor(
    private service: EventService,
    private location: Location,
    private dynTitle: DynamicTitleService,
    private agendaService: AgendaService
  ) {}

  ngOnInit() {
    const orgIds$ = this.searchForm.valueChanges.pipe(startWith(this.searchForm.value));
    const query = ref => ref.where('type', '==', 'screening').where('isSecret', '==', false).orderBy('end').startAt(new Date());
    const events$ = this.service.valueChanges(query) as Observable<Event<Screening>[]>;

    this.events$ = combineLatest([events$, orgIds$]).pipe(
      map(([events, orgs]) =>
        this.filterByOrgIds(
          events,
          orgs.map(org => org.objectID)
        )
      ),
      // We can't filter by meta.titleId directly in the query because range and not equals comparisons must all filter on the same field
      map(events => events.filter(event => !!event.meta.titleId)),
      tap(events => this.setTitle(events.length)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  filterByOrgIds(events: Event<Screening>[], orgIds: string[]) {
    if (!orgIds.length) return events;
    return events.filter(event => orgIds.includes(event.ownerOrgId));
  }

  setTitle(amount: number) {
    amount === 0 ? this.dynTitle.setPageTitle('Screening List', 'Empty') : this.dynTitle.setPageTitle('Screening List');
  }

  goBack() {
    this.location.back();
  }

  exportToCalendar(events: Event[] = []) {
    this.agendaService.download(events);
  }
}
