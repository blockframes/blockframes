import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationMember } from '../../member/+state/member.model';

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
}
