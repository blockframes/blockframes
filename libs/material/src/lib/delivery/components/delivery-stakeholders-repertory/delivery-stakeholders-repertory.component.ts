import { ChangeDetectionStrategy, Component, Input, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { OrganizationAlgoliaResult } from '@blockframes/utils/algolia';
import { Stakeholder } from '../../stakeholder/+state/stakeholder.model';

@Component({
  selector: 'delivery-stakeholders-repertory',
  templateUrl: './delivery-stakeholders-repertory.component.html',
  styleUrls: ['./delivery-stakeholders-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryStakeholdersRepertoryComponent {
  @Output() removed = new EventEmitter<string>();
  @Output() added = new EventEmitter<OrganizationAlgoliaResult>();

  @Input() set stakeholders(stakeholders: Stakeholder[]) {
    this.dataSource = new MatTableDataSource(stakeholders);
  }

  public dataSource: MatTableDataSource<Stakeholder>;
  public displayedColumns: string[] = ['name', 'action'];
}
