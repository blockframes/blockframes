import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { OrganizationMember } from '../../+state';

@Component({
  selector: 'org-signer-repertory',
  templateUrl: './organization-signer-repertory.component.html',
  styleUrls: ['./organization-signer-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSignerRepertoryComponent {
  /** Headline of the columns in the material table. No Headline meanse no text.*/
  public displayedColumns: string[] = ['name', 'email', 'operations', 'action'];

  /** Variable to save the data source of the material table */
  public dataSource: MatTableDataSource<OrganizationMember>;

  public operationMapping: { [k: string]: string } = {
    '=0': 'No operations',
    '=1': '# operation',
    other: '# operations'
  };

  @Input() set members(members: OrganizationMember[]) {
    this.dataSource = new MatTableDataSource(members);
    this.dataSource.sort = this.sort;
  }

  @Output() selected = new EventEmitter<string>();

  /** Init code to work with the build in material sort function.
   * But maybe this will get taken care of by a function in the future.
   */
  @ViewChild(MatSort, { static: true }) sort: MatSort;
}
