// Angular
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ContentChild,
  TemplateRef,
  Directive,
  ChangeDetectorRef
} from '@angular/core';

// RxJs
import { Observable } from 'rxjs';
import { startWith, distinctUntilChanged, tap } from 'rxjs/operators';

// Blockframes
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';

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
export class FormListComponent<T> implements OnInit {

  @Input() form: FormList<T>;
  @Input() buttonText: string = 'Add';

  @ContentChild(ItemRefDirective, { read: TemplateRef }) itemRef: ItemRefDirective;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;

  list$: Observable<any[]>;
  formItem: FormEntity<EntityControl<T>, T>;
  activeIndex: number;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.list$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      distinctUntilChanged())

    /* If form is empty, we need a placeholder for the ngTemplateOutletContext */
    if (this.isFormEmpty) {
      this.add();
    }
  }

  get isFormEmpty() {
    return !this.form.length
  }

  // Add a clean form
  add() {
    this.formItem = this.form.createControl({});
  }

  /* If there is no control in the form it adds a default one for the user to work on. */
  addControl() {
    if (this.isFormEmpty) {
      this.form.push(this.formItem)
    }
    const control = this.form.createControl({})
    this.form.push(control)
    this.formItem = control;
    this.activeIndex = this.form.length - 1
    this.cdr.markForCheck()
  }

  // Edit existing form
  edit(index: number) {
    this.activeIndex = index
    this.formItem = this.form.at(index);
    this.cdr.markForCheck();
  }

  // Remove one line in the form
  remove(index: number) {
    this.form.removeAt(index);
    if (this.activeIndex === index) {
      this.activeIndex = index - 1 < 0 ? 0 : index - 1;
      this.formItem = this.form.at(this.activeIndex)
      if (this.isFormEmpty) {
        this.add()
      }
    }
  }
} 