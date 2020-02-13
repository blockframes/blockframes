import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl, FormArray } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: '[form]chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsAutocompleteComponent implements OnInit {
  /** List of items displayed in the autocomplete */
  @Input() items: any[];
  /** Key of the item to get store */
  @Input() store: string;
  /** Key of the item to display */
  @Input() display: string;
  @Input() selectable = true;
  @Input() removable = true;
  @Input() disabled = false;
  @Input() placeholder = 'New Items';

  // The form to connect to
  @Input() form: FormArray;

  @Output() added = new EventEmitter<any>();
  @Output() removed = new EventEmitter<number>();

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public ctrl = new FormControl();
  public filteredItems: Observable<any[]>;

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  constructor() {}

  ngOnInit() {
    this.filteredItems = this.ctrl.valueChanges.pipe(
      startWith(''),
      map(value => (value ? this._filter(value) : this.items))
    );
  }

  /** Filter the items */
  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.items.filter(item => {
      const key: string = this.store ? item[this.store] : item;
      return key.toLowerCase().indexOf(filterValue) === 0;
    });
  }

  public getLabel(value: string) {
    const item = this.items.find(i => i.slug === value);
    return item ? item.label : '';
  }

  /** Get the item based on the key */
  private _getItem(key: string) {
    return this.store ? this.items.find(item => item[this.store] === key) : key;
  }

  /** Get the value of the item to store */
  public getKey(item: SlugAndLabel) {
    return this.store ? item[this.store] : item;
  }

  /** Get the value of the item to display */
  public getDisplay(item: SlugAndLabel) {
    return this.store ? item[this.display] : item;
  }

  /** Add a chip based on the input */
  public add({ input, value }: MatChipInputEvent) {
    if (this.matAutocomplete.isOpen) return;
    if ((value || '').trim()) this.form.push(new FormControl(value));
    if (input) input.value = '';
    this.ctrl.setValue(null);
  }

  /** Select based on the option */
  public selected({ option }: MatAutocompleteSelectedEvent): void {
    this.added.emit(option.viewValue);
    this.form.push(new FormControl(option.value));
    this.inputEl.nativeElement.value = '';
    this.ctrl.setValue(null);
  }

  /** Remove a chip */
  public remove(i: number) {
    this.form.removeAt(i);
    this.removed.emit(i);
  }
}
