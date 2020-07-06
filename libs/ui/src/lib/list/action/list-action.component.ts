// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  ContentChild,
  TemplateRef,
  Input
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

@Directive({ selector: 'list-action-menu' })
export class ListActionMenuDirective { }

@Component({
  selector: '[actions] bf-list-action',
  templateUrl: 'list-action.component.html',
  styleUrls: ['./list-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListActionComponent {

  public timeFrames = descTimeFrames;
  public pageSizeOptions = [5, 10, 25];
  public pageSize = 10;
  public pageConfig = { from: 0, to: 10 }

  private _actions;
  @Input()
  get actions() { return this._actions }
  set actions(actions: (Notification | Invitation)[]) {
    this._actions = actions.map(action => {
      return {
        date: action.date,
        data: action
      }
    })
  }

  @ContentChild(ListActionHeaderDirective, { read: TemplateRef }) listActionHeader: ListActionHeaderDirective;
  @ContentChild(ListActionItemDirective, { read: TemplateRef }) listActionItem: ListActionItemDirective;
  @ContentChild(ListActionMenuDirective, { read: TemplateRef }) listActionMenu: ListActionMenuDirective;

  markAllAsRead() {
    this._actions.forEach(action => action.data.isRead = true)
  }

  setPage(event: PageEvent) {
    this.pageConfig.from = event.pageIndex * event.pageSize
    this.pageConfig.to = event.pageIndex * event.pageSize + event.pageSize
  }
}
