import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationMember } from '@blockframes/user/+state/user.model';
import { UserRole } from '@blockframes/permissions/+state/permissions.model';

@Component({
  selector: 'member-repertory',
  templateUrl: './member-repertory.component.html',
  styleUrls: ['./member-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberRepertoryComponent {
  @Input() members: OrganizationMember[];

  @Input() isSuperAdmin: boolean;

  @Output() memberRemoved = new EventEmitter<string>();

  @Output() updatedToSuperAdmin = new EventEmitter<string>();
  @Output() updatedToAdmin = new EventEmitter<string>();
  @Output() updatedToMember = new EventEmitter<string>();

  public memberColumns = {
    name: 'Name',
    surname: 'Lastname',
    email: 'Email Address',
    position: 'Position',
    role: 'Permissions'
  };

  get initialColumns() {
    return this.isSuperAdmin
    ? [ 'name', 'surname', 'email', 'position', 'role', 'uid' ]
    : [ 'name', 'surname', 'email', 'position', 'role' ]
  }

  public displayRole(role: UserRole) {
    switch (role) {
      case 'superAdmin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return 'Member';
    }
  }
}
