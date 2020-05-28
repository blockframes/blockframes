import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { EventTypes } from '../../+state/event.firestore';

@Component({
  selector: 'event-empty',
  templateUrl: './empty.component.html',
  styleUrls: ['./empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyComponent {
  @Input() type: EventTypes;
}
