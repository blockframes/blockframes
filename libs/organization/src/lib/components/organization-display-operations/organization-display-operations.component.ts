import { OrganizationOperation } from './../../+state/organization.model';
import {
  Component,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'org-display-operations',
  templateUrl: './organization-display-operations.component.html',
  styleUrls: ['./organization-display-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationDisplayOperationsComponent {

  @Input() set operations(operations: OrganizationOperation[]) {
    this.dataSource = new MatTableDataSource(operations);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<OrganizationOperation>;
  public displayedColumns: string[] = ['name', 'quorum', 'members', 'action'];
}
