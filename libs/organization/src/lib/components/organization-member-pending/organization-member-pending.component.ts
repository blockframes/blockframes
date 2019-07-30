import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Invitation } from '@blockframes/notification';

@Component({
  selector: 'organization-member-pending',
  templateUrl: './organization-member-pending.component.html',
  styleUrls: ['./organization-member-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class OrganizationMemberPendingComponent {
  @Output() accepted = new EventEmitter<string>();
  @Output() declined = new EventEmitter<string>();
  @Input() invitations: Invitation[];
  @Input() isSuperAdmin: boolean;
}
