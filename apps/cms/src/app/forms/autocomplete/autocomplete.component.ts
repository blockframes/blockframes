import { Component, NgModule, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { FormField, FormList } from 'ng-form-factory';
import { MatSelectSchema } from './autocomplete.schema';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'form-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormAutocompleteComponent<T> {
  private options$ = new BehaviorSubject(null);
  @Input() form?: FormField<T> | FormList<any, T>;
  @Input() displayLabel: <T>(key: string | T) => string;
  @Input() 
  set options(options: T[] | Record<string, string>) {
    this.options$.next(options);
  }
  get options() {
    return this.options$.getValue();
  }

  filteredOptions: Observable<(string | T)[]>;
  control = new FormControl();

  constructor() { }

  get schema() {
    return this.form.schema as MatSelectSchema<T>;
  }

  ngOnInit() {
    this.filteredOptions = combineLatest([
      this.control.valueChanges.pipe(startWith('')),
      this.options$.asObservable().pipe(map(options => options || this.schema.options))
    ]).pipe(
      map(([value, options]) => this.filter(value, options))
    );
  }

  private filter(value: string, options: T[] | Record<string, string>): (T | string)[] {
    const filterValue = value.toLowerCase();
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