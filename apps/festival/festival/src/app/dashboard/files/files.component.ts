import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'festival-dashboard-files',
  templateUrl: 'files.component.html',
  styleUrls: ['./files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesViewComponent {
  public org = this.query.getActive();
  constructor(public query: OrganizationQuery) {}
}