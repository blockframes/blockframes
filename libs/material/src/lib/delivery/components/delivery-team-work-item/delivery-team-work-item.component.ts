import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';

@Component({
  selector: 'delivery-team-work-item',
  templateUrl: './delivery-team-work-item.component.html',
  styleUrls: ['./delivery-team-work-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkItemComponent {
  @Input() stakeholder: Stakeholder;
  @Output() updated = new EventEmitter();
  @Output() removed = new EventEmitter();

  public removeStakeholder() {
    this.removed.emit();
  }

  public editStakeholder() {
    this.updated.emit();
  }
}
