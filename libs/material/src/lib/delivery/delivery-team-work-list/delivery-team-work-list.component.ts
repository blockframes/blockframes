import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { DeliveryService } from '../+state';

@Component({
  selector: 'delivery-team-work-list',
  templateUrl: './delivery-team-work-list.component.html',
  styleUrls: ['./delivery-team-work-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamWorkListComponent {
  @Input() stakeholders: Stakeholder[];

  constructor(private service: DeliveryService) {}

  public addStakeholder(stakeholder: Stakeholder) {
    this.service.addStakeholder(stakeholder);
  }
}
