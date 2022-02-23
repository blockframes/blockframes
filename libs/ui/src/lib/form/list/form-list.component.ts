// Angular
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ContentChild,
  TemplateRef,
  Directive,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

// RxJs
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { startWith, distinctUntilChanged, map } from 'rxjs/operators';

// Blockframes
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { AddButtonTextDirective, SaveButtonTextDirective } from '@blockframes/utils/directives/button-text.directive';

@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Directive({ selector: '[itemRef]' })
export class ItemRefDirective { }

@Component({
  selector: '[form] bf-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListComponent<T> implements OnInit, OnDestroy {

  layout = { top: 'column', bottom: 'column-reverse', left: 'row', right: 'row-reverse' };

  @Input() form: FormList<T>;
  @Input() listPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';


  /** Keep the form open after the user has clicked on the add/save button */
  @Input() @boolean keepFormOpen = false;

  /** Reverse the list order: the last added element will appear at the top */
  @Input() set reverseList(shouldReverse: boolean) {
    this.reverseList$.next(coerceBooleanProperty(shouldReverse));
  };
  private reverseList$ = new BehaviorSubject(false);

  @ContentChild(ItemRefDirective, { read: TemplateRef }) itemRef: ItemRefDirective;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;
  @ContentChild(SaveButtonTextDirective, { read: TemplateRef }) saveButtonText: SaveButtonTextDirective;
  @ContentChild(AddButtonTextDirective, { read: TemplateRef }) addButtonText: AddButtonTextDirective;

  list$: Observable<unknown[]>;
  formItem: FormEntity<EntityControl<T>, T>;
  activeIndex: number;
  activeValue: T;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.list$ = combineLatest([
      this.form.valueChanges.pipe(
        startWith(this.form.value),
        distinctUntilChanged()
      ),
      this.reverseList$
    ]).pipe(
      map(([list, reverse]) => reverse ? list.reverse() : list)
    );
    if (this.isFormEmpty) {
      this.add();
    }
  }

  ngOnDestroy() {
    if (this.formItem?.dirty) this.save();
  }

  get isFormEmpty() {
    return !this.form.length;
  }

  get displayCancelButton() {
    return !this.keepFormOpen && this.form.controls.length;
  }

  /** Add a clean form */
  add() {
    this.formItem = this.form.createControl(undefined, this.form.length);
  }

  save() {
    if (this.formItem?.valid) {
      /* If active index is below 0 we want to push the formItem otherwise we are stuck where the table is not shown
      and also no form */
      if (typeof this.activeIndex === 'number' && !this.isFormEmpty) {
        delete this.activeIndex;
      } else {
        this.form.push(this.formItem);
      }
      delete this.formItem;
      this.cdr.markForCheck();

      if (this.keepFormOpen) this.add();
    }
  }

  edit(index: number) {
    this.activeIndex = this.reverseList$.value ? this.form.controls.length - index - 1 : index;
    this.formItem = this.form.at(this.activeIndex);
    this.activeValue = this.formItem.value;
    this.cdr.markForCheck();
  }

  cancel() {
    if (typeof this.activeIndex === 'number') {
      this.form.at(this.activeIndex).setValue(this.activeValue);
      delete this.activeIndex;
      delete this.activeValue;
    }
    delete this.formItem;
  }

  remove(index: number) {
    const i = this.reverseList$.value ? this.form.controls.length - index - 1 : index;
    this.form.removeAt(i);
    if (this.activeIndex > i) {
      this.activeIndex--;
    }
    if (this.isFormEmpty) {
      this.formItem = this.form.createControl();
    }
  }

  computeIndex() {
    // angular template parser doesn't understand the new '??' operator
    // so we extract it in a typescript function
    return this.activeIndex ?? this.form.value.length;
  }
}
