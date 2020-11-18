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
  @Input() buttonText = 'Add';
  @Input() saveButtonText = 'Save'
  @Input() listPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() @boolean autoAdd: boolean = false;
  @Input() set reverseList(shouldReverse: boolean) {
    this.reverseList$.next(coerceBooleanProperty(shouldReverse));
  };

  @ContentChild(ItemRefDirective, { read: TemplateRef }) itemRef: ItemRefDirective;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;

  list$: Observable<any[]>;
  formItem: FormEntity<EntityControl<T>, T>;
  activeIndex: number;
  activeValue: T

  private reverseList$ = new BehaviorSubject(false);

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.list$ = combineLatest([
      this.form.valueChanges.pipe(startWith(this.form.value), distinctUntilChanged()),
      this.reverseList$
    ]).pipe(
      map(([list, reverse]) => reverse ? list.reverse() : list)
    )

    this.add();
  }

  ngOnDestroy() {
    if (this.formItem?.dirty) this.save()
  }

  get isFormEmpty() {
    return !this.form.length
  }

  // Add a clean form
  add() {
    this.formItem = this.form.createControl();
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
    }
    if (this.autoAdd) this.add()
  }

  edit(index: number) {
    this.activeIndex = index
    this.formItem = this.form.at(index);
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
    if (this.autoAdd) this.add()
  }

  remove(index: number) {
    this.form.removeAt(index);
    if (this.activeIndex > index) {
      this.activeIndex--;
    }
    if (this.isFormEmpty) {
      this.add();
    }
  }
}
