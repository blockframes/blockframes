import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EventForm } from '../event.form';

@Component({
  selector: '[form] edit-event-details',
  templateUrl: 'edit-details.component.html',
  styleUrls: ['./edit-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDetailsComponent {
  @Input() form: EventForm;
}