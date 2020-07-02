// Angular
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Directive,
  ContentChild,
  TemplateRef,
  Output,
  EventEmitter
} from '@angular/core';

@Directive({ selector: '[listActionHeader]' })
export class ListActionHeaderDirective { }

@Directive({ selector: '[listActionMenu]]' })
export class ListActionMenuDirective { }

@Directive({ selector: '[listActionButtons]' })
export class ListActionButtonsDirective { }

@Directive({ selector: '[listActionItem]' })
export class ListActionItemDirective { }

@Directive({ selector: '[listActionPagination]' })
export class ListActionPaginationDirective { }

@Component({
  selector: 'bf-list-action',
  templateUrl: 'list-action.component.html',
  styleUrls: ['./list-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListActionComponent implements OnInit {

  @ContentChild(ListActionHeaderDirective, { read: TemplateRef }) listActionHeader: ListActionHeaderDirective;
  @ContentChild(ListActionMenuDirective, { read: TemplateRef }) listActionMenu: ListActionMenuDirective;
  @ContentChild(ListActionButtonsDirective, { read: TemplateRef }) listActionButtons: ListActionButtonsDirective;
  @ContentChild(ListActionItemDirective, { read: TemplateRef }) listActionItemDirective: ListActionItemDirective;
  @ContentChild(ListActionPaginationDirective, { read: TemplateRef }) listActionPagination: ListActionPaginationDirective;

  @Output() markedAll = new EventEmitter();

  constructor() { }

  ngOnInit() { }
}
