// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  ContentChild,
  TemplateRef,
  Input,
  Output,
  EventEmitter,
  ViewEncapsulation
} from '@angular/core';

// Blockframes
import { descTimeFrames } from '@blockframes/utils/pipes';
import { Invitation } from '@blockframes/invitation/+state';
import { Notification } from '@blockframes/notification/+state';

// Material
import { PageEvent } from '@angular/material/paginator';

@Directive({ selector: 'list-action-header' })
export class ListActionHeaderDirective { }

@Directive({ selector: '[listActionItem]' })
export class ListActionItemDirective { }

@Directive({ selector: '[listActionMenu]' })
export class ListActionMenuDirective { }

@Component({
  selector: '[actions] bf-list-action',
  templateUrl: 'list-action.component.html',
  styleUrls: ['./list-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ListActionComponent {

  public timeFrames = descTimeFrames;
  public pageSizeOptions = [5, 10, 25];
  public pageSize = 10;
  public pageConfig = { from: 0, to: 10 }

  @Input() actions: (Notification | Invitation)[];

  @Output() markAsRead = new EventEmitter();

  @ContentChild(ListActionHeaderDirective, { read: TemplateRef }) listActionHeader: ListActionHeaderDirective;
  @ContentChild(ListActionItemDirective, { read: TemplateRef }) listActionItem: ListActionItemDirective;
  @ContentChild(ListActionMenuDirective, { read: TemplateRef }) listActionMenu: ListActionMenuDirective;

  setPage(event: PageEvent) {
    this.pageConfig.from = event.pageIndex * event.pageSize
    this.pageConfig.to = event.pageIndex * event.pageSize + event.pageSize
  }
}
