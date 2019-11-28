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
import { OrganizationMember } from '@blockframes/organization/member/+state/member.model';
import { DaoOperation } from '../../+state';

interface OperationMember extends OrganizationMember {
  operationIds: string[];
}

@Component({
  selector: 'dao-signer-repertory',
  templateUrl: './dao-signer-repertory.component.html',
  styleUrls: ['./dao-signer-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DaoSignerRepertoryComponent {
  /** Headline of the columns in the material table. No Headline means no text.*/
  public displayedColumns: string[] = ['name', 'email', 'operations', 'action'];

  /** Variable to save the data source of the material table */
  public dataSource: MatTableDataSource<OperationMember>;

  public operationMapping: { [k: string]: string } = {
    '=0': 'No operations',
    '=1': '# operation',
    other: '# operations'
  };

  private _members: OrganizationMember[] = [];
  private _operations: DaoOperation[] = [];

  @Input()
  set members(members: OrganizationMember[]) {
    this._members = members;
    this.joinMemberAndOperation();
  }
  get members() { return this._members; }

  @Input()
  set operations(operations: DaoOperation[]) {
    this._operations = operations;
    this.joinMemberAndOperation();
  }
  get operations() { return this._operations; }

  @Output() selected = new EventEmitter<string>();

  /** Init code to work with the build in material sort function.
   * But maybe this will get taken care of by a function in the future.
   */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  private joinMemberAndOperation() {

    const getOperationIds = (member: OrganizationMember) => this._operations
    .filter(operation => operation.members.some(operationMember => member.uid === operationMember.uid))
    .map(operation => operation.id);

    const operationMembers: OperationMember[] = this._members.map(member => {
      const operationIds = getOperationIds(member);
      return { ...member, operationIds };
    });

    this.dataSource = new MatTableDataSource(operationMembers);
    this.dataSource.sort = this.sort;
  }
}
