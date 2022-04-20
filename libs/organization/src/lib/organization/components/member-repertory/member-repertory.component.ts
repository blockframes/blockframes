import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { OrganizationMember, UserRole } from '@blockframes/model';
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
  @Input() @boolean showActions = false;

  @Output() memberRemoved = new EventEmitter<string>();

  @Output() updatedToSuperAdmin = new EventEmitter<string>();
  @Output() updatedToAdmin = new EventEmitter<string>();
  @Output() updatedToMember = new EventEmitter<string>();

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
