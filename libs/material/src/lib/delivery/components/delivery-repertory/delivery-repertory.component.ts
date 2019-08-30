import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { Delivery } from '../../+state/delivery.model';
import { Organization } from '@blockframes/organization';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'delivery-repertory',
  templateUrl: './delivery-repertory.component.html',
  styleUrls: ['./delivery-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryRepertoryComponent {
  @Input()
  set deliveries(deliveries: Delivery[]) {
    this.dataSource = new MatTableDataSource(deliveries);
    this.dataSource.sort = this.sort;
  }
  @Input() userOrganization: Organization;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<Delivery>;
  public displayedColumns: string[] = ['signers', 'status', 'mgCurrentDeadline'];
}
