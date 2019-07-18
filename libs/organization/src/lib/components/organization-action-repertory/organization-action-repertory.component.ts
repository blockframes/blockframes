import { Component, Input, ViewChild, OnInit, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';

@Component({
  selector: 'org-action-repertory',
  templateUrl: './organization-action-repertory.component.html',
  styleUrls: ['./organization-action-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActionRepertoryComponent implements OnInit {
  /** Headline of the columns in the material table */
  public displayedColumns: string[] = ['empty', 'Quorum', 'Active', 'empty2'];

  /** Variable to save the data source of the material table */
  // TODO #638 replace any
  public dataSource: MatTableDataSource<Array<any>>;

  // TODO #638: replace any
  @Input() actionGroups: any;

  // TODO #638: replace any
  @Output() editAction: EventEmitter<any> = new EventEmitter();

  /** Init code to work with the build in material sort function */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.actionGroups);
    this.dataSource.sort = this.sort;
  }
}
