import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { UserRole, OrganizationService, OrganizationQuery, OrganizationMember } from '../../+state';
import { Router } from '@angular/router';
import { PermissionsQuery, PermissionsService } from '../../permissions/+state';

@Component({
  selector: '[formGroup] member-form-role',
  templateUrl: './member-form-role.component.html',
  styleUrls: ['./member-form-role.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MemberFormRoleComponent {
  constructor(
    public controlContainer: ControlContainer,
    private service: OrganizationService,
    private query: OrganizationQuery,
    private permissionsService: PermissionsService,
    private permissionsQuery: PermissionsQuery,
    private router: Router,
  ) {}

  get control() {
    return this.controlContainer.control;
  }

  public get name() {
    const {name} = this.control.value;
    return name;
  }

  public get role() {
    return this.control.get('role');
  }

  public get canChangeRole() {
    const cannotChange =
      this.role.value === UserRole.admin
      && this.permissionsQuery.superAdminCount <= 1;
    return !cannotChange;
  }

  public async changeRole(role: UserRole) {
    if (!this.canChangeRole) {
      throw new Error('You can not change the role of the last Admin of an organization');
    }
    const { uid } = this.control.value;

    const members = this.query.getValue().org.members
      .filter(member => member.uid !== uid)
      .map(member => {
        if (!member.role) {
          return {...member, role: this.permissionsQuery.isUserSuperAdmin(member.uid) ? UserRole.admin : UserRole.member} as OrganizationMember;
        }
        return member;
      });
    const memberToUpdate = this.query.getValue().org.members.find(member => member.uid === uid);

    const newMember: OrganizationMember = {...memberToUpdate, role};
    members.push(newMember);
    this.permissionsService.updateMembersRole(members);
  }
}
