import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { InvitationQuery } from '@blockframes/invitation/+state';

@Component({
  selector: 'festival-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationComponent implements OnInit {

  invitations$ = this.query.selectAll();

  constructor(private query: InvitationQuery) { }

  ngOnInit(): void {
  }

}
