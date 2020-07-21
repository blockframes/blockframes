import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '@blockframes/invitation/+state';

@Component({
  selector: 'invitation-guest-item',
  templateUrl: './guest-item.component.html',
  styleUrls: ['./guest-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestItemComponent {

  @Input() invitation: Invitation;

}
