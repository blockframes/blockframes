import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';
import { Notification } from '../../+state';
import { PageEvent } from '@angular/material/paginator';

import { descTimeFrames, filterByDate, TimeFrame } from '@blockframes/utils/pipes/filter-by-date.pipe';

interface NotificationWithTimeFrame extends Notification {
  timeFrame?: TimeFrame
}

@Component({
  selector: 'notification-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  rows: NotificationWithTimeFrame[] = [];

  @Input() set notifications(notifs: Notification[]) {
    this.timeFrames.forEach(timeFrame => {
      const notificationsFiltered = filterByDate(notifs, timeFrame);
      let shouldDisplayTimeFrame = true; // TimeFrame is displayed only once for each notification of the same timeFrame
      if (!!notificationsFiltered && notificationsFiltered.length) {
        notificationsFiltered.forEach(notification => {
          const invitationWithTimeFrame = { ...notification } as NotificationWithTimeFrame;
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
