import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';

@Component({
  selector: 'festival-dashboard-files',
  templateUrl: 'files.component.html',
  styleUrls: ['./files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesViewComponent {
  constructor(public query: OrganizationQuery) {}
}