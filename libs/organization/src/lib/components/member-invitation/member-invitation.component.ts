import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Invitation, InvitationFromOrganizationToUser } from '@blockframes/invitation/types';
@Component({
  selector: 'member-invitation',
  templateUrl: './member-invitation.component.html',
  styleUrls: ['./member-invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberInvitationComponent {
  @HostBinding('attr.page-id') pageId = 'member-invitation';
  @Output() declined = new EventEmitter<InvitationFromOrganizationToUser>();
  @Input() invitations: InvitationFromOrganizationToUser[];
  @Input() isAdmin: boolean;
}
