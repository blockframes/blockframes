import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryService } from '../../+state';

@Component({
  selector: 'delivery-team-work-item',
  templateUrl: './delivery-team-work-item.component.html',
  styleUrls: ['./delivery-team-work-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkItemComponent {
  @Input() stakeholder: Stakeholder;
  @Output() update = new EventEmitter();

  constructor(private service: DeliveryService) {}

  public removeStakeholder() {
    this.service.removeStakeholder(this.stakeholder.id);
  }

  public editStakeholder() {
    this.update.emit();
  }
}
