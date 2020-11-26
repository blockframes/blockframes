import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormList } from 'ng-form-factory';
import { MatMultiSelectSchema } from '../select';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'form-chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormChipsAutocompleteComponent<T, O> implements OnInit {
  options$ = new BehaviorSubject(null);
  @Input() form?: FormList<any, T>;
  @Input() displayLabel: (option: O) => string;
  @Input() getValue: (option: O) => T;
  @Input() 
  private set options(options: Record<string, O>) {
    this.options$.next(options);
  }
  private get options() {
    return this.options$.getValue();
  }

  filteredOptions: Observable<string[]>;
  chips: T[] = [];
  control = new FormControl();

  constructor() { }

  get schema() {
    return this.form.schema as MatMultiSelectSchema<T>;
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
    this.control.reset('');
  }
}

