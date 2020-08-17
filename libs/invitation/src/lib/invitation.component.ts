import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { InvitationQuery, InvitationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'invitation-view',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent implements OnInit {

  // Invitation that require an action
  invitations$ = this.query.toMe();

  constructor(
    private query: InvitationQuery,
    private service: InvitationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    !!this.query.getAll().length ?
      this.dynTitle.setPageTitle('Invitations List') :
      this.dynTitle.setPageTitle('Invitations List - Empty');
  }

  acceptAll() {
    const invitations = this.query.getAll().filter(i => this.query.isToMe(i));
    for (const invitation of invitations) {
      this.service.acceptInvitation(invitation);
    }
  }
}
