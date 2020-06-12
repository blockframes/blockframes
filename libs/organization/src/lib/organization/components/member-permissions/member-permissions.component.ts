import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'member-permissions',
  templateUrl: './member-permissions.component.html',
  styleUrls: ['./member-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberPermissionsComponent {
  @Input() uid: string;
  @Input() icon = 'more_vert';

  @Output() memberRemoved = new EventEmitter<string>();
  @Output() updatedToSuperAdmin = new EventEmitter<string>();
  @Output() updatedToAdmin = new EventEmitter<string>();
  @Output() updatedToMember = new EventEmitter<string>();

}
