import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Invitation, InvitationService } from '../+state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'invitation-item',
  templateUrl: './invitation-item.component.html',
  styleUrls: ['./invitation-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationItemComponent implements OnInit {
  @Input() invitation: Invitation;

  constructor(private service: InvitationService, private snackBar: MatSnackBar) {}

  ngOnInit() {}

  acceptInvitation(invitation: Invitation) {
    this.service.acceptInvitation(invitation.id);
    this.snackBar.open(
      `You accepted to join the delivery's teamwork. You will receive another notification when you'll be able to navigate to the document`,
      'close',
      { duration: 5000 }
    );
  }
}
