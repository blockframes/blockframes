import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { InvitationDetailed } from '@blockframes/model';
import { filters } from '@blockframes/ui/list/table/filters';
import { sorts } from '@blockframes/ui/list/table/sorts';

@Component({
  selector: 'invitation-list-table',
  templateUrl: './invitation-list.component.html',
  styleUrls: ['./invitation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvitationListComponent {
  public filters = filters;
  public sorts = sorts;

  @Input() invitations: InvitationDetailed[];

}
