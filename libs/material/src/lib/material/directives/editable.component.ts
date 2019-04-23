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
import { Material } from '../+state';

@Component({
  selector: 'material-editable',
  template: `
    <ng-container *ngTemplateOutlet="currentView"></ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditableComponent implements OnInit, OnDestroy {
  @ContentChild(ViewModeDirective) viewModeTpl: ViewModeDirective;
  @ContentChild(EditModeDirective) editModeTpl: EditModeDirective;

  @Input() material: Material;
  @Input() set materialId(id: string) {
    this._materialId.next(id);
  }
  private _materialId = new BehaviorSubject<any>(null);
  private materialId$ = this._materialId.asObservable();

  private isAlive = true;

  private mode: 'view' | 'edit' = 'view';

  constructor() {}

  ngOnInit() {
    this.materialId$
      .pipe(takeWhile(() => this.isAlive))
      .subscribe(id => (id === this.material.id ? (this.mode = 'edit') : (this.mode = 'view')));
  }

  get currentView() {
    return this.mode === 'view' ? this.viewModeTpl.tpl : this.editModeTpl.tpl;
  }

  ngOnDestroy() {
    this.isAlive = false;
  }
}
