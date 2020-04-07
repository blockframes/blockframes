import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl, FormArray } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FormList } from '@blockframes/utils/form';

@Component({
  selector: '[form]chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsAutocompleteComponent implements OnInit {

  /** List of items displayed in the autocomplete */
  @Input() items: SlugAndLabel[];
  @Input() selectable = true;
  @Input() removable = true;
  @Input() disabled = false;
  @Input() placeholder = 'New Items';

  // The parent form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  // the local form control for the input
  public ctrl = new FormControl();

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public filteredItems: Observable<any[]>;

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;

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
      const key: string = item['slug'];
      return key.toLowerCase().indexOf(filterValue) === 0;
    });
  }

  public getLabel(value: string) {
    const item = this.items.find(i => i.slug === value);
    return item ? item.label : '';
  }

  /** Add a chip based on the input */
  public add({ input, value }: MatChipInputEvent) {
    if (this.matAutocomplete.isOpen) return;
    if ((value || '').trim()) this.form.add(value);
    if (input) input.value = '';
    this.ctrl.setValue(null);
  }

  /** Select based on the option */
  public selected({ option }: MatAutocompleteSelectedEvent): void {
    this.added.emit(option.viewValue);
    this.form.add(option.value);
    this.inputEl.nativeElement.value = '';
    this.ctrl.setValue(null);
  }

  /** Remove a chip */
  public remove(i: number) {
    this.form.removeAt(i);
    this.removed.emit(i);
  }
}
