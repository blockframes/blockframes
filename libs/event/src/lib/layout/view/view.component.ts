import { Component, OnInit, Input } from '@angular/core';
import { Event } from '../../+state/event.model';

@Component({
  selector: 'event-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class EventViewComponent implements OnInit {

  @Input() event: Event;

  constructor() { }

  ngOnInit(): void {
  }

}
