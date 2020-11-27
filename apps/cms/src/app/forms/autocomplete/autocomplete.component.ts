import { Component, Input, ChangeDetectionStrategy, EventEmitter, Output, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormField } from 'ng-form-factory';
import { MatSelectSchema } from '../select';
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
  @Input() form?: FormField<MatSelectSchema<string>>;
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
    return this.form.schema;
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
    const value = this.form.value;
    this.change.emit(value in this.options ? value : null);
  }

  displayWith(value: string) {
    if (!value || !this.options) return '';
    return this.displayLabel(this.options[value]);
  }

}


