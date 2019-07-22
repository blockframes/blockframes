import {
  Component,
  Input,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { Action } from '../../+state';

@Component({
  selector: 'org-action-repertory',
  templateUrl: './organization-action-repertory.component.html',
  styleUrls: ['./organization-action-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationActionRepertoryComponent implements OnInit {
  /** Headline of the columns in the material table */
  public displayedColumns: string[] = ['No Headline', 'Quorum', 'Active', 'No Headline2'];

  /** Variable to save the data source of the material table */
  public dataSource: MatTableDataSource<Action>;

  @Input() actions: Action[];

  @Output() selected = new EventEmitter();

  /** Init code to work with the build in material sort function */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.actions);
    this.dataSource.sort = this.sort;
  }
}
