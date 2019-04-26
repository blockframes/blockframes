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
  private colors = ['#ee4825', '#2577ee', '#d925ee', '#25ee53', '#7c857e', '#d375d8', '#75d2d8', '#d0c461'];

  constructor(private service: DeliveryService) {}

  public addStakeholder(stakeholder: Stakeholder) {
    this.service.addStakeholder(stakeholder);
  }

  public getColor(id: string) {
    const index = id.charCodeAt(0) % this.colors.length;
    return this.colors[index];
  }
}
