import { Component, ChangeDetectionStrategy, TemplateRef, ContentChild, Input } from '@angular/core';
import { Notification } from '../../+state';
import { descTimeFrames } from '@blockframes/utils/pipes/filter-by-date.pipe';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'notification-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  @Input() notifications: Notification[];
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
