import { Component, NgModule, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { FormList } from 'ng-form-factory';
import { MatMulitSelectSchema } from './chips-autocomplete.schema';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'form-chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormChipsAutocompleteComponent<T, O> {
  private options$ = new BehaviorSubject(null);
  @Input() form?: FormList<any, T>;
  @Input() displayLabel: (option: O) => string;
  @Input() getValue: (option: O) => T;
  @Input() 
  set options(options: Record<string, O>) {
    this.options$.next(options);
  }
  get options() {
    return this.options$.getValue();
  }

  filteredOptions: Observable<string[]>;
  chips: T[] = [];
  control = new FormControl();

  constructor() { }

  get schema() {
    return this.form.schema as MatMulitSelectSchema<T>;
  }

  ngOnInit() {
    this.filteredOptions = combineLatest([
      this.control.valueChanges.pipe(startWith('')),
      this.options$.asObservable().pipe(map(options => options || this.schema.options))
    ]).pipe(
      map(([value, options]) => this.filter(value, options))
    );
  }

  private filter(value: string, options: Record<string, O>): string[] {
    const filterValue = value.toLowerCase();
    if (!options) return [];
    return Object.keys(options).filter(key => {
      const label = this.displayLabel(options[key]);
      return label.toLowerCase().startsWith(filterValue);
    });
  }

  remove(index: number) {
    this.form.removeAt(index);
  }

  add(event: MatAutocompleteSelectedEvent) {
    const option = this.options[event.option.value];
    const value = this.getValue(option);
    this.form.add(value);
    this.control.reset();
  }
}


@NgModule({
  declarations: [FormChipsAutocompleteComponent],
  exports: [FormChipsAutocompleteComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule
  ]
})
export class FormChipsAutocompleteModule { }