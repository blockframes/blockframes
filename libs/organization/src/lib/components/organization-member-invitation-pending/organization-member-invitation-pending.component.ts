import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Invitation } from '@blockframes/notification';

@Component({
  selector: 'organization-member-invitation-pending',
  templateUrl: './organization-member-invitation-pending.component.html',
  styleUrls: ['./organization-member-invitation-pending.component.scss']
})

export class OrganizationMemberInvitationPendingComponent {
  @Output() declined = new EventEmitter<string>();
  @Input() invitations: Invitation[];
}
