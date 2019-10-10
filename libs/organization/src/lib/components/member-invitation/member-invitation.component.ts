import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Invitation } from '@blockframes/invitation/types';
@Component({
  selector: 'member-invitation',
  templateUrl: './member-invitation.component.html',
  styleUrls: ['./member-invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberInvitationComponent {
  @HostBinding('attr.page-id') pageId = 'member-invitation';
  @Output() declined = new EventEmitter<Invitation>();
  @Input() invitations: Invitation[];
  @Input() isSuperAdmin: boolean;
}
