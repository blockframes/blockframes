import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';

@Component({
  selector: 'delivery-team-work-repertory',
  templateUrl: './delivery-team-work-repertory.component.html',
  styleUrls: ['./delivery-team-work-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkRepertoryComponent {
  @Input() stakeholders: Stakeholder[];
  @Output() added = new EventEmitter();

  public addStakeholder(stakeholder: Stakeholder) {
    this.added.emit(stakeholder);
  }
}
