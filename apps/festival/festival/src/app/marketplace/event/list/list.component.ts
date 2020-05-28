import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Event, EventService } from '@blockframes/event/+state';
import { Observable } from 'rxjs';
import { slideDown } from '@blockframes/utils/animations/fade';

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
    this.events$ = this.service.queryByType(['screening'], ref => ref.orderBy('start').startAt(new Date()));
  }

}
