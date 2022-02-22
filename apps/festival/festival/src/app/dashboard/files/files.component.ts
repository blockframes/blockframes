import { ChangeDetectionStrategy, Component } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-dashboard-files',
  templateUrl: 'files.component.html',
  styleUrls: ['./files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesViewComponent  {
  org$ = this.orgService.currentOrg$;

  constructor(private orgService: OrganizationService, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('My files')
  }
}
