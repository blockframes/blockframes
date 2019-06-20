import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';

@Component({
  selector: 'delivery-teamwork-item',
  templateUrl: './delivery-teamwork-item.component.html',
  styleUrls: ['./delivery-teamwork-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkItemComponent {
  @Input() stakeholder: Stakeholder;
  @Output() updated = new EventEmitter();
  @Output() removed = new EventEmitter();
}
