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
import { startWith, tap } from 'rxjs/operators';

// Blockframes
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';


@Directive({ selector: '[formView]' })
export class FormViewDirective { }

@Component({
  selector: '[form] bf-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormListComponent<T> implements OnInit {

  @Input() form: FormList<T>;

  @ContentChild(TemplateRef) template: TemplateRef<any>;
  @ContentChild(FormViewDirective, { read: TemplateRef }) formView: FormViewDirective;

  list$: Observable<any[]>;
  showSave: boolean;
  formItem: FormEntity<EntityControl<T>, T>;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.list$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      tap(value => value ? this.formItem = this.form.at(0) : this.add()));
  }

  // Add a clean form and show save button
  add() {
    this.formItem = this.form.createControl({});
    this.showSave = true;
  }

  // Edit existing form, we don't want save button as content is updated in real time
  edit(index: number) {
    this.formItem = this.form.at(index);
    this.showSave = false;
    this.cdr.markForCheck();
  }

  // Remove one line in the form
  remove(index: number) {
    this.form.removeAt(index);
  }

  // Push the form into the list
  save() {
    this.form.push(this.formItem);
    this.showSave = false;
    this.cdr.markForCheck();
  }
}