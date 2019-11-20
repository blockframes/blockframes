import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectionStrategy, Output, EventEmitter } from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';


@Component({
  selector: 'chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsAutocompleteComponent implements OnInit {

  @Input() items: any[];
  @Input() key: string;
  @Input() keys: string[] = [];
  @Input() selectable = true;
  @Input() removable = true;
  @Input() placeholder = 'New Items';

  @Output() added = new EventEmitter<any>();
  @Output() removed = new EventEmitter<number>();

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public ctrl = new FormControl();
  public filteredItems : Observable<any[]>;

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

  constructor() {}

  ngOnInit() {
    this.filteredItems = this.ctrl.valueChanges.pipe(
      startWith(''),
      map(item => item ? this._filter(item) : this.items)
    );
  }

  /** Filter the items */
  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.items.filter(item => {
      const key: string = this.key ? item[this.key] : item;
      return key.toLowerCase().indexOf(filterValue) === 0;
    })
  }

  /** Get the item based on the key */
  private _getItem(key: string) {
    return this.key ? this.items.find(item => item[this.key] === key) : key;
  }

  /** Get the key of the item */
  public getKey(item: any) {
    return this.key ? item[this.key] : item;
  }

  /** Add a chip based on the input */
  public add({input, value}: MatChipInputEvent) {
    if (this.matAutocomplete.isOpen) return;
    if ((value || '').trim()) this.keys.push(value);
    if (input) input.value = '';
    this.ctrl.setValue(null);
  }

  /** Select based on the option */
  public selected({option}: MatAutocompleteSelectedEvent): void {
    this.added.emit(option.viewValue);
    this.inputEl.nativeElement.value = '';
    this.ctrl.setValue(null);
  }

  /** Remove a chip */
  public remove(key: string) {
    const index = this.keys.indexOf(key);
    if (index >= 0) this.removed.emit(index);
  }

}
