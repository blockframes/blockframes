import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation, InvitationService } from '../../+state';

@Component({
  selector: 'invitation-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  @Input() invitation: Invitation;
  constructor(private serivce: InvitationService,) { }

  ngOnInit(): void {
  }
  accept(id: string) {
    this.serivce.update(id, { status: 'accepted' });
  }

  refuse(id: string) {
    this.serivce.update(id, { status: 'declined' });
  }
}
