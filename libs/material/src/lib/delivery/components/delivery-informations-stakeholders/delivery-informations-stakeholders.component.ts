import { Component, ChangeDetectionStrategy, Input } from "@angular/core";
import { Delivery } from "../../+state";

@Component({
  selector: 'delivery-informations-stakeholders',
  templateUrl: './delivery-informations-stakeholders.component.html',
  styleUrls: ['./delivery-informations-stakeholders.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeliveryInformationsStakeholdersComponent {
  
  @Input() delivery: Delivery;

  public displayedColumns: string[] = ['logo', 'stakeholder', 'hasSigned'];

  constructor() {}

  public hasSigned(stakeholderId: string) {
    return this.delivery.validated.some(id => id === stakeholderId) ? 'signed' : 'not signed';
  }
}