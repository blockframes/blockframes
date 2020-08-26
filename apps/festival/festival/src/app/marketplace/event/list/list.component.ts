import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Event, EventService } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { slideDown } from '@blockframes/utils/animations/fade';
import { map, tap } from 'rxjs/operators';
import { Location } from '@angular/common';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  events$: Observable<Event[]>;

  constructor(
    private service: EventService,
    private location: Location,
    private dynTitle: DynamicTitleService,
    ) { }

  ngOnInit(): void {
    const query = ref => ref.orderBy('end').startAt(new Date());

    this.events$ = this.service.queryByType(['screening'], query).pipe(
      // We can't filter by meta.titleId directly in the query because
      // firestore supports only one orderBy if it uses .where()
      map(events => events.filter(event => !!event.meta.titleId)),
      tap(events => {
        !!events.length ?
          this.dynTitle.setPageTitle('Screening List') :
          this.dynTitle.setPageTitle('Screening List', 'Empty');
      }),
    );
  }

  goBack() {
    this.location.back();
  }

}
