import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Event, EventService } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { slideDown } from '@blockframes/utils/animations/fade';
import { map } from 'rxjs/operators';

@Component({
  selector: 'festival-event-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {
  events$: Observable<Event[]>;

  constructor(private service: EventService) { }

  ngOnInit(): void {
    const query = ref => ref
      .orderBy('end').startAt(new Date());
    this.events$ = this.service.queryByType(['screening'], query).pipe(
      map(events => events.filter(event => !!event.meta.titleId))
    );
  }

}
