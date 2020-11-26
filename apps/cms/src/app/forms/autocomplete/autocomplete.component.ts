import { Component, NgModule, Input, ChangeDetectionStrategy, ChangeDetectorRef, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { FormField } from 'ng-form-factory';
import { MatSelectSchema } from './autocomplete.schema';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'form-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormAutocompleteComponent<T, O> implements OnInit {
  private options$ = new BehaviorSubject<Record<string, O>>(null);
  @Output() change = new EventEmitter<string>();
  @Input() form?: FormField<string>;
  @Input() displayLabel: (option: O) => string;
  @Input() getValue: (option: O) => string;
  @Input() 
  set options(options: Record<string, O>) {
    this.options$.next(options);
  }
  get options() {
    return this.options$.getValue();
  }

  filteredOptions: Observable<string[]>;
  control = new FormControl();

  constructor() { }

  get schema() {
    return this.form.schema as MatSelectSchema<T>;
  }

  ngOnInit() {
    this.filteredOptions = combineLatest([
      this.control.valueChanges.pipe(startWith('')),
      this.options$.asObservable()
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

  onChange() {
    this.change.emit(this.form.value);
  }

  displayWith(value: string) {
    if (!value || !this.options) return '';
    return this.displayLabel(this.options[value]);
  }

}


@NgModule({
  declarations: [FormAutocompleteComponent],
  exports: [FormAutocompleteComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatChipsModule,
  ]
})
export class FormAutocompleteModule { }