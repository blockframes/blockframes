// Angular
import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';

// Material
import { PageEvent } from '@angular/material/paginator';

// Blockframes
import { descTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';

import { Invitation } from '../../+state';

@Component({
  selector: 'invitation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() invitations: Invitation[];
  @ContentChild(TemplateRef) itemTemplate: TemplateRef<any>;

  timeFrames = descTimeFrames;

  pageSizeOptions = [5, 10, 25];
  pageSize = 10;
  pageConfig = { from: 0, to: this.pageSize }

  public setPage(event: PageEvent) {
    this.pageConfig.from = event.pageIndex * event.pageSize
    this.pageConfig.to = event.pageIndex * event.pageSize + event.pageSize
  }
}
