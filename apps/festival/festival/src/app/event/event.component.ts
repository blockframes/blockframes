import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'festival-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventComponent { }
