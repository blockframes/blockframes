// Angular
import {
  Component,
  ChangeDetectionStrategy,
  Directive,
  ContentChild,
  TemplateRef,
  AfterViewInit,
  Input
} from '@angular/core';

// Blockframes
import { Notification } from '@blockframes/notification/+state';
import { Invitation } from '@blockframes/invitation/+state';
import { descTimeFrames } from '@blockframes/utils/pipes';


@Directive({ selector: 'list-action-header' })
export class ListActionHeaderDirective { }

@Directive({ selector: '[listActionItem]' })
export class ListActionItemDirective { }

@Directive({ selector: 'list-action-menu' })
export class ListActionMenuDirective { }

@Directive({ selector: '[listActionPagination]' })
export class ListActionPaginationDirective { }

@Component({
  selector: '[actions] bf-list-action',
  templateUrl: 'list-action.component.html',
  styleUrls: ['./list-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListActionComponent implements AfterViewInit {

  public timeFrames = descTimeFrames;

  private _actions;
  @Input()
  get actions() { return this._actions }
  set actions(actions: Notification[]) {
    this._actions = actions.map(action => {
      return {
        date: new Date((action as any).date._seconds * 1000),
        data: action
      }
    })
    console.log(this._actions)
  }

  @ContentChild(ListActionHeaderDirective, { read: TemplateRef }) listActionHeader: ListActionHeaderDirective;
  @ContentChild(ListActionItemDirective, { read: TemplateRef }) listActionItem: ListActionItemDirective;
  @ContentChild(ListActionMenuDirective, { read: TemplateRef }) listActionMenu: ListActionMenuDirective;
  @ContentChild(ListActionPaginationDirective, { read: TemplateRef }) listActionPagination: ListActionPaginationDirective;

  constructor() { }

  ngAfterViewInit() { }

  markAllAsRead() {
    this._actions.forEach(action => action.data.isRead = true)
  }

  set(from, to) { }
}
