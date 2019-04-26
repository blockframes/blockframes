import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ContentChild,
  Input,
  TemplateRef
} from '@angular/core';
import { ViewModeDirective } from './view-mode-directive';
import { EditModeDirective } from './edit-mode-directive';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ui-editable',
  template: `
    <ng-container *ngTemplateOutlet="(mode$ | async)"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableComponent implements OnInit {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;

  @Input() item: any;
  @Input() set itemId(id: string) {
    this._itemId.next(id);
  }
  private _itemId = new BehaviorSubject<any>(null);
  private itemId$ = this._itemId.asObservable();

  public mode$: Observable<TemplateRef<any>>;

  ngOnInit() {
    this.mode$ = this.itemId$.pipe(
      map(id => (id === this.item.id ? this.editModeTpl.tpl : this.viewModeTpl.tpl))
    );
  }
}
