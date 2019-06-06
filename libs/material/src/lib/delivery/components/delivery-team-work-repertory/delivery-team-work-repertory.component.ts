import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryService } from '../../+state';

@Component({
  selector: 'delivery-team-work-repertory',
  templateUrl: './delivery-team-work-repertory.component.html',
  styleUrls: ['./delivery-team-work-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkRepertoryComponent {
  @Input() stakeholders: Stakeholder[];

  constructor(private service: DeliveryService) {}

  public addStakeholder(stakeholder: Stakeholder) {
    this.service.addStakeholder(stakeholder);
  }
}
