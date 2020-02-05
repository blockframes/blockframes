import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationMember } from '../../member/+state/member.model';

@Component({
  selector: 'member-repertory',
  templateUrl: './member-repertory.component.html',
  styleUrls: ['./member-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberRepertoryComponent {
  public memberColumns = {
    name: 'Name',
    surname: 'Lastname',
    email: 'Email Address',
    position: 'Position',
    role: 'Permissions'
  };

  @Input() members: OrganizationMember[];

  @Input() isSuperAdmin: boolean;

  @Output() editing = new EventEmitter<string>();

  get initialColumns() {
    return this.isSuperAdmin
    ? [ 'name', 'surname', 'email', 'position', 'role', 'action' ]
    : [ 'name', 'surname', 'email', 'position', 'role' ]
  }
}
