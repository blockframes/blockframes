import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationMember } from '@blockframes/model';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'member-repertory',
  templateUrl: './member-repertory.component.html',
  styleUrls: ['./member-repertory.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberRepertoryComponent {
  @Input() members: OrganizationMember[];
  @Input() showFilter = false;
  @Input() isSuperAdmin: boolean;
  @Input() @boolean showEdit = false;

  @Output() memberRemoved = new EventEmitter<string>();

  @Output() updatedToSuperAdmin = new EventEmitter<string>();
  @Output() updatedToAdmin = new EventEmitter<string>();
  @Output() updatedToMember = new EventEmitter<string>();

  @Input() memberColumns = {
    uid: '',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    position: 'Position',
    role: 'Permissions'
  };

  @Input() memberColumnsIndex = ['firstName', 'lastName', 'email', 'position', 'role'];


  get variableColumns() {
    return this.memberColumnsIndex.filter(col => !['firstName', 'lastName', 'role', 'uid', 'edit'].includes(col))
  }
}
