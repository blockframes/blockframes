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
import { OrganizationOperation } from '../../+state';
import { PermissionsQuery } from '../../permissions/+state';
import { OrganizationMember, UserRole } from '../../member/+state/member.model';

interface OperationMember extends OrganizationMember {
  operationIds: string[];
}

@Component({
  selector: 'org-signer-repertory',
  templateUrl: './organization-signer-repertory.component.html',
  styleUrls: ['./organization-signer-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationSignerRepertoryComponent {
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
  private _operations: OrganizationOperation[] = [];

  @Input()
  set members(members: OrganizationMember[]) {
    this._members = members;
    this.joinMemberAndOperation();
  }
  get members() { return this._members; }

  @Input()
  set operations(operations: OrganizationOperation[]) {
    this._operations = operations;
    this.joinMemberAndOperation();
  }
  get operations() { return this._operations; }

  @Output() selected = new EventEmitter<string>();

  /** Init code to work with the build in material sort function.
   * But maybe this will get taken care of by a function in the future.
   */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private permissionQuery: PermissionsQuery) {}

  private joinMemberAndOperation() {

    const getOperationIds = (member: OrganizationMember) => this._operations
    .filter(operation => operation.members.some(operationMember => member.uid === operationMember.uid))
    .map(operation => operation.id);

    const operationMembers: OperationMember[] = this._members.map(member => {
      const operationIds = getOperationIds(member);
      let role: UserRole;
      switch(true) {
        case this.permissionQuery.getValue().superAdmins.includes(member.uid):
          role = UserRole.superAdmin;
          break;
        case this.permissionQuery.getValue().admins.includes(member.uid):
          role = UserRole.admin;
          break;
        case this.permissionQuery.getValue().members.includes(member.uid):
          role = UserRole.member;
          break;
        default:
          throw new Error(`Member ${member.name} ${member.surname} with id ${member.uid} has no role.`);
      }
      return { ...member, operationIds, role };
    });

    this.dataSource = new MatTableDataSource(operationMembers);
    this.dataSource.sort = this.sort;
  }
}
