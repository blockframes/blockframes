// Angular
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// RxJs
import { Observable, Subscription } from 'rxjs';
import { startWith, map, distinctUntilChanged } from 'rxjs/operators';

// Blockframes
import { staticModel, Scope } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { FormList } from '@blockframes/utils/form';
import { getKeyIfExists } from '@blockframes/utils/helpers';

@Component({
  selector: '[form]chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsAutocompleteComponent implements OnInit, OnDestroy {

  /**
   * The static model to display
   * @example
   * <chips-autocomplete scope="TERRITORIES" ...
   */
  @Input() scope: Scope;
  @Input() selectable = true;
  @Input() removable = true;
  @Input() disabled = false;
  @Input() placeholder = '';
  @Input() @boolean required: boolean;
  /* Values should be unique in the input */
  @Input() @boolean uniqueValues: boolean;
  @Input() withoutValues: string[] = []
  // The parent form to connect to
  @Input()
  get form(): FormList<unknown> { return this._form }
  set form(form) {
    this._form = form
    this.values$ = form.valueChanges.pipe(startWith(this.form.value));
  };
  private _form

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  // the local form control for the input
  public ctrl = new FormControl();

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public filteredItems$: Observable<unknown[]>;
  public values$: Observable<unknown[]>;
  private sub: Subscription;

  private items: string[];
  @ViewChild('inputEl') inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('chipList') chipList: MatChipList;

  ngOnInit() {
    this.items = this.withoutValues.length
      ? Object.keys(staticModel[this.scope]).filter((keys) => !this.withoutValues.includes(keys))
      : Object.keys(staticModel[this.scope]);

    this.filteredItems$ = this.ctrl.valueChanges.pipe(
      startWith(''),
      map(value => (value ? this._filter(value) : this.items).sort((a, b) => a.localeCompare(b)))
    );
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res.length),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  /** Filter the items */
  private _filter(value: string) {
    const filterValue = value.toLowerCase();
    return this.items.filter(item => {
      return staticModel[this.scope][item].toLowerCase().includes(filterValue);
    });
  }

  /** Add a chip based on key code */
  public add({ value }: MatChipInputEvent) {
    value.trim();
    const keyByValue = getKeyIfExists(this.scope, value)
    if (value && keyByValue) {
      if (this.uniqueValues && !this.form.value.includes(keyByValue)) {
        this.form.add(keyByValue);
        this.added.emit(value);
      } else if (!this.uniqueValues) {
        this.form.add(keyByValue);
        this.added.emit(value);
      }
    }
    this.inputEl.nativeElement.value = ''
    this.ctrl.setValue(null);
  }

  /** Select based on the option */
  public selected({ option }: MatAutocompleteSelectedEvent) {
    if (this.uniqueValues && !this.form.value.includes(option.value)) {
      this.added.emit(option.viewValue);
      this.form.add(option.value);
    } else if (!this.uniqueValues) {
      this.added.emit(option.viewValue);
      this.form.add(option.value);
    }
    this.inputEl.nativeElement.value = '';
    this.ctrl.setValue(null);
    this.focusOut();
  }

  /** Remove a chip */
  public remove(i: number) {
    this.form.removeAt(i);
    this.removed.emit(i);
  }

  public focusOut() {
    this.chipList.errorState = !this.form.valid;
  }
}
