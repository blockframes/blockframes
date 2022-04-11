import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationDetailed } from '@blockframes/model';

@Component({
  selector: 'invitation-list-table',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent {

  @Input() invitations: InvitationDetailed[];

}
