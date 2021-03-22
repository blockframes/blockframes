import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-dashboard-files',
  templateUrl: 'files.component.html',
  styleUrls: ['./files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesViewComponent  {
  org$ = this.orgQuery.selectActive();

  constructor(private orgQuery: OrganizationQuery, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('My files')
  }
}
