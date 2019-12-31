import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Delivery, DeliveryQuery, DeliveryService } from '../../+state';
import { StakeholderService } from '../../stakeholder/+state/stakeholder.service';
import { Observable } from 'rxjs';
import { OrganizationAlgoliaResult } from '@blockframes/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Stakeholder } from '../../stakeholder/+state/stakeholder.model';

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
    private deliveryService: DeliveryService,
    private query: DeliveryQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.delivery$ = this.query.selectActive();
  }

  public removeStakeholder(stakeholder: Stakeholder) {
    try {
      this.stakeholderService.remove(stakeholder.orgId);
      this.snackBar.open(
        `You removed ${stakeholder.organization.name} from the delivery.`,
        'close',
        { duration: 2000 }
      );
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public addStakeholder({ objectID }: OrganizationAlgoliaResult) {
    // TODO: handle promises correctly (update loading status, send back error report, etc). => ISSUE#612
    try {
      const delivery = this.query.getActive();
      this.stakeholderService.addStakeholder(delivery.id, objectID);
      this.deliveryService.update(delivery.id, {
        stakeholderIds: [...delivery.stakeholderIds, objectID]
      });
      this.snackBar.open(`You invited a new organization to work on the delivery`, 'close', {
        duration: 2000
      });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
