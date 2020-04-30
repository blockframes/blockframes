import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation, InvitationService } from '../../+state';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent {

  @Input() invitation: Invitation;
  constructor(private serivce: InvitationService,) { }

  accept(id: string) {
    this.serivce.update(id, { status: 'accepted' });
  }

  refuse(id: string) {
    this.serivce.update(id, { status: 'declined' });
  }
}
