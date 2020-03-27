import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { EventForm } from '../event.form';

@Component({
  selector: 'event-form',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventFormComponent {
  @Input() form = new EventForm();
}
