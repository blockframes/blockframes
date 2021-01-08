import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Event, EventService } from '@blockframes/event/+state';
import { BehaviorSubject, Subscription } from 'rxjs';
import { slideDown } from '@blockframes/utils/animations/fade';
import { map, startWith, switchMap, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { FormList } from '@blockframes/utils/form';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';
import { ascTimeFrames } from '@blockframes/utils/pipes';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {
  private _events = new BehaviorSubject<Event[]>([]);
  private allEvents: Event[] = [];

  timeFrames = [];

  public events$ = this._events.asObservable();
  public searchForm = FormList.factory<AlgoliaOrganization>([]);
  public loading = true;

  private sub: Subscription;

  constructor(
    private service: EventService,
    private location: Location,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    const query = ref => ref.orderBy('end').startAt(new Date());

    this.sub = this.service.queryByType(['screening'], query).pipe(
      // We can't filter by meta.titleId directly in the query because
      // firestore supports only one orderBy if it uses .where()
      map(events => events.filter(event => !!event.meta.titleId)),
      tap(events => {
        if (!!events.length) {
          this.timeFrames = ascTimeFrames;
          this.loading = false;
          this.dynTitle.setPageTitle('Screening List');
        } else {
          this.dynTitle.setPageTitle('Screening List', 'Empty');
        }
      }),
      // Putting the events in their timeframes
      tap(events => this.allEvents = events),
      switchMap(() => this.searchForm.valueChanges.pipe(
        startWith(this.searchForm.value)
      )),
      map(results => results.map(org => org.objectID)),
      tap(orgIds => {
        if (!!orgIds.length) {
          const events = this.allEvents.filter(event => orgIds.includes(event.org.id))
          this._events.next(events)
        } else {
          this._events.next(this.allEvents)
        }
        this.timeFrames = this._events.value.length ? ascTimeFrames : [];
      })
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goBack() {
    this.location.back();
  }

}
