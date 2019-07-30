import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Invitation } from '@blockframes/notification';

@Component({
  selector: 'organization-member-invitation',
  templateUrl: './organization-member-invitation.component.html',
  styleUrls: ['./organization-member-invitation.component.scss']
})

export class OrganizationMemberInvitationComponent {
  @Output() declined = new EventEmitter<string>();
  @Input() invitations: Invitation[];
  @Input() isSuperAdmin: boolean;
}
