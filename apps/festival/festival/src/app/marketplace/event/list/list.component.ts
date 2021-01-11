import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Event, EventService } from '@blockframes/event/+state';
import { combineLatest, Observable } from 'rxjs';
import { slideDown } from '@blockframes/utils/animations/fade';
import { map, startWith, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FormList } from '@blockframes/utils/form';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  public events$: Observable<Event[]>;
  public searchForm = FormList.factory<AlgoliaOrganization>([]);
  public loading = true;

  constructor(
    private service: EventService,
    private location: Location,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    const orgIds$ = this.searchForm.valueChanges.pipe(startWith(this.searchForm.value));
    const query = ref => ref.where('meta.titleId', '!=', '').orderBy('meta.titleId').orderBy('end').startAt(new Date());
    const events$ = this.service.queryByType(['screening'], query);

    this.events$ = combineLatest(events$, orgIds$).pipe(
      map(([ events, orgs ]) => this.filterByOrgIds(events, orgs.map(org => org.objectID))),
      tap(events => {
        this.loading = false;
        this.setTitle(events.length)
      })
    )
  }

  filterByOrgIds(events: Event[], orgIds: string[]) {
    if (!orgIds.length) return events;
    return events.filter(event => orgIds.includes(event.org.id));
  }

  setTitle(amount: number) {
    amount === 0 ? this.dynTitle.setPageTitle('Screening List', 'Empty') : this.dynTitle.setPageTitle('Screening List');
  }

  goBack() {
    this.location.back();
  }

}
