import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationDetailed } from '@blockframes/model';
import { filters } from '@blockframes/ui/list/table/filters';

@Component({
  selector: 'invitation-list-table',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent {
  public filters = filters;

  @Input() invitations: InvitationDetailed[];

}
