import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Invitation } from '@blockframes/notification/invitation/+state/invitation.model';
@Component({
  selector: 'member-pending',
  templateUrl: './member-pending.component.html',
  styleUrls: ['./member-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MemberPendingComponent {
  @HostBinding('attr.page-id') pageId = 'member-invitation';
  @Output() declined = new EventEmitter<Invitation>();
  @Input() invitations: Invitation[];
  @Input() isAdmin: boolean;
}
