import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ContentChild,
  OnDestroy,
  Input
} from '@angular/core';
import { ViewModeDirective } from './view-mode-directive';
import { EditModeDirective } from './edit-mode-directive';
import { BehaviorSubject } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
// tslint:disable-next-line: component-selector
  selector: 'editable',
  template: `
    <ng-container *ngTemplateOutlet="currentView"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableComponent implements OnInit, OnDestroy {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;

  @Input() item: any;
  @Input() set itemId(id: string) {
    this._itemId.next(id);
  }
  private _itemId = new BehaviorSubject<any>(null);
  private itemId$ = this._itemId.asObservable();

  private isAlive = true;

  private mode: 'view' | 'edit' = 'view';

  constructor() {}

  ngOnInit() {
    this.itemId$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe(id => (id === this.item.id ? (this.mode = 'edit') : (this.mode = 'view')));
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
