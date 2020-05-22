import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery } from '@blockframes/invitation/+state';

@Component({
  selector: 'catalog-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {

  invitations$ = this.query.selectAll({ filterBy: invitation => invitation.mode === 'invitation'});
  constructor(private query: InvitationQuery) { }
}
