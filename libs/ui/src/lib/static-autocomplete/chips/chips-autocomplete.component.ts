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
} from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

// RxJs
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

// Blockframes
import { staticModels } from '@blockframes/utils/static-model';
import { SlugAndLabel, Scope, getCodeIfExists } from '@blockframes/utils/static-model/staticModels';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { FormList } from '@blockframes/utils/form';

@Component({
  selector: '[form][scope]chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsAutocompleteComponent implements OnInit {

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
  @Input() withoutValues: string[] = []
  // The parent form to connect to
  @Input()
  get form(): FormList<any> { return this._form }
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
  public filteredItems$: Observable<any[]>;
  public values$: Observable<any[]>;

  private items: SlugAndLabel[];

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('chipList') chipList: MatChipList;

  ngOnInit() {
    this.items = this.withoutValues.length
      ? (staticModels[this.scope] as SlugAndLabel[]).filter(value => !this.withoutValues.includes(value.slug))
      : staticModels[this.scope] as SlugAndLabel[];
    if (this.placeholder === '') {
      this.placeholder = `${this.scope[0].toUpperCase()}${this.scope.slice(1).toLowerCase()}`;
    }

    this.filteredItems$ = this.ctrl.valueChanges.pipe(
      startWith(''),
      map(value => (value ? this._filter(value) : this.items).sort((a, b) => a.label.localeCompare(b.label)))
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

  /** Add a chip based on key code */
  public add({ value }: MatChipInputEvent) {
    value.trim();
    const slugByLabel = getCodeIfExists(this.scope, value)
    if (value && slugByLabel) {
      this.form.add(slugByLabel);
      this.added.emit(value);
    }
    this.inputEl.nativeElement.value = ''
    this.ctrl.setValue(null);
  }

  /** Select based on the option */
  public selected({ option }: MatAutocompleteSelectedEvent) {
    this.added.emit(option.viewValue);
    this.form.add(option.value);
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
