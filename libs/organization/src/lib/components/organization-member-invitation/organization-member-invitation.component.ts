import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Invitation } from '@blockframes/notification';

@Component({
  selector: 'organization-member-invitation',
  templateUrl: './organization-member-invitation.component.html',
  styleUrls: ['./organization-member-invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationMemberInvitationComponent {
  @Output() declined = new EventEmitter<string>();
  @Input() invitations: Invitation[];
  @Input() isSuperAdmin: boolean;
}
