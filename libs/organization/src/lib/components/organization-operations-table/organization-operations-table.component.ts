import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OrganizationOperation } from './../../+state/organization.model';
import {
  Component,
  Input,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'org-operations-table',
  templateUrl: './organization-operations-table.component.html',
  styleUrls: ['./organization-operations-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationOperationsTableComponent implements OnInit {
  /** Headline of the columns in the material table. No Headline means no text. */
  public displayedColumns: string[] = ['Operation', 'Quorum', 'Active', 'No Headline2'];

  /** Variable to save the data source of the material table */
  public dataSource: MatTableDataSource<OrganizationOperation>;

  /** Mapping for helping with the correct grammar. */
  public memberMapping: { [k: string]: string } = {
    '=0': 'No member',
    '=1': '1 member',
    other: '# members'
  };

  @Input() operations: OrganizationOperation[];

  @Output() editOperation = new EventEmitter<OrganizationOperation>();

  /** Init code to work with the build in material sort function */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource<OrganizationOperation>(this.operations);
    this.dataSource.sort = this.sort;
  }
}
