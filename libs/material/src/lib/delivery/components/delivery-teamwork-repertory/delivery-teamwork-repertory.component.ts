import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';

@Component({
  selector: 'delivery-teamwork-repertory',
  templateUrl: './delivery-teamwork-repertory.component.html',
  styleUrls: ['./delivery-teamwork-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkRepertoryComponent {
  @Input() stakeholders: Stakeholder[];
  @Output() added = new EventEmitter();
}
