import {
  Component,
  OnInit,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatTableDataSource, MatSort } from '@angular/material';
import { OrgMember } from '../../+state';

@Component({
  selector: 'org-signer-repertory',
  templateUrl: './organization-signer-repertory.component.html',
  styleUrls: ['./organization-signer-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSignerRepertoryComponent implements OnInit {
  /** Headline of the columns in the material table */
  public displayedColumns: string[] = ['User', 'Mail', 'Signatory on', 'No Headline'];

  /** Variable to save the data source of the material table */
  public dataSource: MatTableDataSource<OrgMember>;

  @Input() signerList: OrgMember[];

  @Output() selected = new EventEmitter<OrgMember>();

  /** Init code to work with the build in material sort function */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.signerList);
    this.dataSource.sort = this.sort;
  }
}
