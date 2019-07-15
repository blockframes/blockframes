import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation } from '../+state';

@Component({
  selector: 'invitation-item',
  templateUrl: './invitation-item.component.html',
  styleUrls: ['./invitation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationItemComponent implements OnInit {
  @Input() invitation: Invitation;

  constructor() { }

  ngOnInit() {
  }

}
