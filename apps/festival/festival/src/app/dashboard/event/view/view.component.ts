import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { EventQuery } from '@blockframes/event/+state/event.query';

@Component({
  selector: 'festival-event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventViewComponent implements OnInit {

  event$ = this.query.selectActive();


  constructor(private query: EventQuery) { }

  ngOnInit() {

  }

}
