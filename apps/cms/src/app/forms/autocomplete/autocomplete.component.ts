import { Component, NgModule, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormOutlet, FormField, FormControlSchema, FormList } from 'ng-form-factory';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { MatFormFieldSchema } from '../schema';


type OptionMap<T> = T extends (infer I)[] 
  ? Partial<Record<Extract<I, string>, any>>
  : Partial<Record<Extract<T, string>, any>>;

export interface MatSelectSchema<T> extends FormControlSchema<T>, MatFormFieldSchema<T> {
  options: OptionMap<T> | T[];
  multiple: boolean;
}

@Component({
  selector: 'form-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormAutocompleteComponent<T> {
  @Input() form?: FormField<T> | FormList<any, T>;
  @Input() options?: T[] | Record<string, string>;
  @Input() displayLabel: <T>(key: string | T) => string;

  filteredOptions: Observable<(string | T)[]>;
  control = new FormControl();

  constructor() { }

  get schema() {
    return this.form.schema as MatSelectSchema<T>;
  }

  ngOnInit() {
    this.filteredOptions = this.control.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filter(value))
      );
  }

  private filter(value: string): (T | string)[] {
    const filterValue = value.toLowerCase();
    const options = this.options || this.schema.options;
    if (!options) return [];
    if (Array.isArray(options)) {
      return options.filter(option => this.displayLabel(option).toLowerCase().includes(filterValue));
    } else {
      return Object.keys(options).filter((key) => this.displayLabel(key).toLowerCase().includes(filterValue));
    }
  }
}


@NgModule({
  declarations: [FormAutocompleteComponent],
  exports: [FormAutocompleteComponent, MatAutocompleteModule],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
  ]
})
export class FormAutocompleteModule { }