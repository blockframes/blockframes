// Angular
import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';

// Material
import { PageEvent } from '@angular/material/paginator';

// Blockframes
import { descTimeFrames, filterByDate, TimeFrame } from '@blockframes/utils/pipes/filter-by-date.pipe';

import { Invitation } from '../../+state';

interface InvitationWithTimeFrame extends Invitation {
  timeFrame?: TimeFrame
}

@Component({
  selector: 'invitation-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  rows: InvitationWithTimeFrame[] = [];

  @Input() set invitations(invits: Invitation[]) {
    this.rows = [];
    this.timeFrames.forEach(timeFrame => {
      const invitationsFiltered = filterByDate(invits, timeFrame);
      let shouldDisplayTimeFrame = true; // TimeFrame is displayed only once for each invitations of the same timeFrame
      if (!!invitationsFiltered && invitationsFiltered.length) {
        invitationsFiltered.forEach(invitation => {
          const invitationWithTimeFrame = { ...invitation } as InvitationWithTimeFrame;
          if (shouldDisplayTimeFrame) {
            invitationWithTimeFrame.timeFrame = timeFrame;
            shouldDisplayTimeFrame = false;
          }
          this.rows.push(invitationWithTimeFrame);
        })
      }
    });
  }

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
