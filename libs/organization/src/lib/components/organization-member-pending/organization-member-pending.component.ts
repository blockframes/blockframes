import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Invitation } from '@blockframes/notification';

@Component({
  selector: 'organization-member-pending',
  templateUrl: './organization-member-pending.component.html',
  styleUrls: ['./organization-member-pending.component.scss']
})

export class OrganizationMemberPendingComponent {
  @Output() accepted = new EventEmitter<string>();
  @Input() invitations: Invitation[];
}
