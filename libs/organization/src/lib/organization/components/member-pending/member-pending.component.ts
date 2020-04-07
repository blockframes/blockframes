import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { InvitationFromOrganizationToUser } from '@blockframes/invitation/types';
@Component({
  selector: 'member-pending',
  templateUrl: './member-pending.component.html',
  styleUrls: ['./member-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberPendingComponent {
  @Output() declined = new EventEmitter<InvitationFromOrganizationToUser>();
  @Input() invitations: InvitationFromOrganizationToUser[];
  @Input() isAdmin: boolean;
}
