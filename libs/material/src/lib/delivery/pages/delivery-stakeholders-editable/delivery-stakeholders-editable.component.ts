import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Delivery, DeliveryQuery } from '../../+state';
import { StakeholderService } from '../../stakeholder/+state/stakeholder.service';
import { Observable } from 'rxjs';
import { OrganizationAlgoliaResult } from '@blockframes/utils';
import { createDeliveryStakeholder } from '../../stakeholder/+state/stakeholder.firestore';

@Component({
  selector: 'delivery-stakeholders-editable',
  templateUrl: './delivery-stakeholders-editable.component.html',
  styleUrls: ['./delivery-stakeholders-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryStakeholdersEditableComponent implements OnInit {
  public opened = false;

  public delivery$: Observable<Delivery>;

  constructor(
    private stakeholderService: StakeholderService,
    private query: DeliveryQuery
  ) {}

  ngOnInit() {
    this.delivery$ = this.query.selectActive();
  }

  public removeStakeholder(stakeholderId: string) {
    this.stakeholderService.remove(stakeholderId);
  }

  public addStakeholder({ objectID }: OrganizationAlgoliaResult) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    this.stakeholderService.add(createDeliveryStakeholder({orgId: objectID}));
  }
}
