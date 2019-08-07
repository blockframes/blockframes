import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StakeholderService } from '@blockframes/movie';
import { DeliveryQuery } from '../../+state';
import { OrganizationAlgoliaResult } from '@blockframes/utils';

@Component({
  selector: 'delivery-teamwork-repertory',
  templateUrl: './delivery-teamwork-repertory.component.html',
  styleUrls: ['./delivery-teamwork-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryTeamworkRepertoryComponent {
  constructor(private service: StakeholderService, private query: DeliveryQuery) {}

  public submit({ objectID }: OrganizationAlgoliaResult) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    const delivery = this.query.getActive();
    this.service.addStakeholder(delivery, objectID);
  }
}
