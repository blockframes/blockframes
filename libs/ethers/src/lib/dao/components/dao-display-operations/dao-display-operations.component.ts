import {
  Component,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { DaoOperation } from '../../+state';

@Component({
  selector: 'dao-display-operations',
  templateUrl: './dao-display-operations.component.html',
  styleUrls: ['./dao-display-operations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaoDisplayOperationsComponent {

  @Input() set operations(operations: DaoOperation[]) {
    this.dataSource = new MatTableDataSource(operations);
    this.dataSource.sort = this.sort;
  }

  @Output() editing = new EventEmitter<string>();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  public dataSource: MatTableDataSource<DaoOperation>;
  public displayedColumns: string[] = ['name', 'quorum', 'members', 'action'];
}
