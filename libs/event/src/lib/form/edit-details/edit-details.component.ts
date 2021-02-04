import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EventForm } from '../event.form';

@Component({
  selector: '[form] event-details-edit',
  templateUrl: 'edit-details.component.html',
  styleUrls: ['./edit-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditDetailsComponent {
  @Input() form: EventForm;
}