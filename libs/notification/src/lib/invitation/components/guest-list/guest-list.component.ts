import { Component, ChangeDetectionStrategy, Input, TemplateRef, ContentChild } from '@angular/core';
import { Invitation } from '@blockframes/invitation/+state';

@Component({
  selector: 'invitation-guest-list',
  templateUrl: './guest-list.component.html',
  styleUrls: ['./guest-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestListComponent {
  @Input() invitations: Invitation[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

}
