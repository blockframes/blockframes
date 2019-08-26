import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Stakeholder } from '@blockframes/movie';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'delivery-stakeholders-repertory',
  templateUrl: './delivery-stakeholders-repertory.component.html',
  styleUrls: ['./delivery-stakeholders-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryStakeholdersRepertoryComponent {
  @Input() set stakeholders(stakeholders: Stakeholder[]) {
    this.dataSource = new MatTableDataSource(stakeholders);
  }

  public dataSource: MatTableDataSource<Stakeholder>;
  public displayedColumns: string[] = ['name', 'actions'];
}
