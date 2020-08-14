import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Input,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
} from '@angular/core';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { FormList } from '@blockframes/utils/form';
import { staticModels } from '@blockframes/utils/static-model';

@Component({
  selector: '[form][model]chips-autocomplete',
  templateUrl: './chips-autocomplete.component.html',
  styleUrls: ['./chips-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChipsAutocompleteComponent implements OnInit, OnDestroy {

  /**
   * The static model to display
   * @example
   * <chips-autocomplete model="TERRITORIES" ...
   */
  @Input() model: string;
  @Input() selectable = true;
  @Input() removable = true;
  @Input() disabled = false;
  @Input() placeholder = '';

  // The parent form to connect to
  @Input() form: FormList<string>;

  @Output() added = new EventEmitter<string>();
  @Output() removed = new EventEmitter<number>();

  // the local form control for the input
  public ctrl = new FormControl();

  public separatorKeysCodes: number[] = [ENTER, COMMA];
  public filteredItems$: Observable<any[]>;
  public values$: Observable<any[]>;

  private sub: Subscription;
  private items: SlugAndLabel[];

  @ViewChild('inputEl', { static: true }) inputEl: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: true }) matAutocomplete: MatAutocomplete;
  @ViewChild('chipList') chipList: MatChipList;

  ngOnInit() {
    this.values$ = this.form.valueChanges.pipe(startWith(this.form.value));
    this.items = staticModels[this.model];

    if (this.placeholder === '') {
      this.placeholder = `${this.model[0].toUpperCase()}${this.model.slice(1).toLowerCase()}`;
    }

    this.filteredItems$ = this.ctrl.valueChanges.pipe(
      startWith(''),
      map(value => (value ? this._filter(value) : this.items).sort((a, b) => a.label.localeCompare(b.label)))
    );

    this.sub = this.form.statusChanges.subscribe(status => this.chipList.errorState = status === 'INVALID')

  }

  ngOnDestroy() {
    this.sub.unsubscribe();
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
