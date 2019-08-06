import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Invitation } from '@blockframes/notification';

@Component({
  selector: 'member-invitation',
  templateUrl: './member-invitation.component.html',
  styleUrls: ['./member-invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberInvitationComponent {
  @Output() declined = new EventEmitter<string>();
  @Input() invitations: Invitation[];
  @Input() isSuperAdmin: boolean;
}
