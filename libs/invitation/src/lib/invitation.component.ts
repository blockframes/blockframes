import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { InvitationQuery, InvitationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'invitation-view',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent implements OnInit, OnDestroy {

  // Invitation that require an action
  invitations$ = this.query.toMe();

  private sub: Subscription;

  constructor(
    private query: InvitationQuery,
    private service: InvitationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.sub = this.invitations$.subscribe(invitations => {
      !!invitations.length ?
        this.dynTitle.setPageTitle('Invitations List') :
        this.dynTitle.setPageTitle('Invitations List', 'Empty');
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  acceptAll() {
    const invitations = this.query.getAll().filter(i => this.query.isToMe(i));
    for (const invitation of invitations) {
      this.service.acceptInvitation(invitation);
    }
  }
}
