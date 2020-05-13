import { Component, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery } from '@blockframes/invitation/+state';

@Component({
  selector: 'festival-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent {

  invitations$ = this.query.selectAll();

  constructor(private query: InvitationQuery) { }

}
