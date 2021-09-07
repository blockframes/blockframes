import {
  ChangeDetectionStrategy, Component, Input, forwardRef,
  Pipe, PipeTransform, ElementRef, ViewChild, OnInit,
  OnDestroy, Optional, Self, HostBinding
} from "@angular/core";
import {
  FormControl, ControlValueAccessor,
  Validators, NgControl,
  Validator, AbstractControl, ValidationErrors,
} from "@angular/forms";
import { BehaviorSubject, combineLatest, Observable, Subscription, defer, Subject } from "rxjs";
import { map, startWith, shareReplay, pairwise } from "rxjs/operators";
import { GroupScope, Scope, StaticGroup, staticGroups, staticModel } from '@blockframes/utils/static-model';
import { MatFormFieldControl } from "@angular/material/form-field";
import { coerceBooleanProperty } from "@angular/cdk/coercion";


type GroupMode = 'indeterminate' | 'checked' | 'unchecked';

function filter([groups, text]: [StaticGroup[], string], scope: Scope) {
  if (!text) return groups;
  const search = text.toLowerCase();
  const result: StaticGroup[] = [];
  for (const group of groups) {
    if (group.label.toLowerCase().includes(search)) {
      result.push(group);
    } else {
      const items = group.items.filter(item => {
        return staticModel[scope][item].toLowerCase().includes(search);
      });
      if (items.length) {
        result.push({ ...group, items });
      }
    }
  }
  return result;
}

function getMode(group: StaticGroup, value: string[]): GroupMode {
  const items = group.items.filter(item => value.includes(item));
  if (!items.length) return 'unchecked';
  if (items.length === group.items.length) return 'checked';
  return 'indeterminate';
}
function getRootMode(groups: StaticGroup[], value: string[]): GroupMode {
  if (!value.length) return 'unchecked';
  if (groups.every(group => getMode(group, value) === 'checked')) return 'checked';
  return 'indeterminate';
}

function getItems(groups: StaticGroup[]): string[] {
  return groups.reduce((items, group) => items.concat(group.items), []);
}


function checkIsControlValid(values: string[]): ValidationErrors | null {
  if (values?.length < 1) {
    return {
      mustBePositive: {
        length: values.length
      }
    };
  }
  return null;
}

@Component({
  selector: 'static-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: MatFormFieldControl, useExisting: forwardRef(() => StaticGroupComponent) },
  ]
})
export class StaticGroupComponent implements ControlValueAccessor, OnInit, OnDestroy, MatFormFieldControl<string[]> {
  private subs: Subscription[] = [];
  private onTouch: () => void;
  modes: Record<string, Observable<GroupMode>> = { };
  filteredGroups$: Observable<StaticGroup[]>;
  groups$ = new BehaviorSubject<StaticGroup[]>([]);
  private _placeholder = 'Tap to filter';
  focused = false;
  touched = false;
  private _required = false;
  private _disabled = false;
  hidden: Record<string, boolean> = { }
  stateChanges = new Subject<void>();

  // all items includes the values of checked items which are not in the filter
  allItems: string[] = [];

  @HostBinding() id = `static-group-${Math.random()}`;
  @HostBinding('attr.aria-describedby') _ariaDescribedBy = '';
  @HostBinding('class.floating') get shouldLabelFloat() { return this.focused || !this.empty; }


  @ViewChild('inputEl') input: ElementRef<HTMLInputElement>;
  @Input() displayAll = '';
  @Input() withoutValues: string[] = [];
  @Input() scope: GroupScope;
  @Input() set placeholder(placeholder:string) {
    this._placeholder = placeholder;
    this.stateChanges.next();
  };
  @Input() get required() { return this._required; };
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  @Input() get disabled() { return this._disabled; };
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.form.disable() : this.form.enable();
    this.stateChanges.next();
  }

  form = new FormControl([], this.required ? [Validators.required] : []);
  // defer the startWith value with subscription happens to get first value
  value$ = defer(() => this.form.valueChanges.pipe(
    startWith(this.form.value || []),
    shareReplay(1)
  ));

  get groups() {
    return this.groups$.getValue();
  }

  set value(values: string[] | null) {
    this.form.setValue(values)
    this.touched = true;
    this.stateChanges.next();
  }

  get empty() {
    return !this.form.value?.length;
  }

  search = new FormControl();
  trackByLabel = (i: number, group: StaticGroup) => group.label;

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private _elementRef: ElementRef<HTMLElement>,
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    this.filteredGroups$ = combineLatest([
      this.groups$.asObservable(),
      this.search.valueChanges.pipe(startWith(this.search.value))
    ]).pipe(map(result => filter(result, this.scope)));

    const sub = combineLatest([
      this.filteredGroups$.pipe(map(getItems)),
      this.form.valueChanges.pipe(pairwise())
    ]).subscribe(([filteredItems, [prev, next]]) => {
      if (prev) {
        // checked but filtered out values
        const hiddenValues = prev.filter(value => !filteredItems.includes(value));
        if (hiddenValues.length && !next.includes(hiddenValues[0])) {
          // add back the values
          this.form.setValue(next.concat(hiddenValues));
        }
      }
      this.allItems = this.form.value;
    })
    this.subs.push(sub);
  }

  ngOnInit() {
    const groups = staticGroups[this.scope];
    if (this.withoutValues.length) {
      for (const group of groups) {
        /* eslint-disable */
        group.items = (group.items as any[]).filter((item: string) => !this.withoutValues.includes(item));
      }
    }
    this.groups$.next(groups);
  }

  onOpen(opened: boolean) {
    if (opened) {
      this.input.nativeElement.focus();
      this.touched = true;
    } else {
      this.form.setValue(this.allItems);
      this.search.setValue('');
    }
  }

  // Control value accessor

  writeValue(value: string[]): void {
    this.form.reset(value);
  }

  registerOnChange(fn: () => void): void {
    const sub = this.form.valueChanges.subscribe(fn);
    this.subs.push(sub);
  }

  registerOnTouched(fn: () => void) {
    this.onTouch = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  get errorState(): boolean {
    return Boolean(checkIsControlValid(this.form.value)) && this.touched;
  }


  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (!this._elementRef.nativeElement.contains(event.relatedTarget as Element)) {
      this.focused = false;
      this.touched = true;
      this.stateChanges.next();
    }
  }

  setDescribedByIds(ids: string[]) {
    this._ariaDescribedBy = ids.join(' ')
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'mat-select') {
      (this._elementRef.nativeElement.querySelector('mat-select') as HTMLElement).focus();
    }
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    this.stateChanges.complete();
  }

  // all check

  checkAll(checked: boolean) {
    if (!checked) {
      this.form.reset([]);
    } else {
      const value = getItems(this.groups);
      this.form.reset(value);
    }
  }


  // Per group
  checkGroup(group: StaticGroup, checked: boolean, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const value = this.form.value || [];
    const items = group.items || [];
    if (checked) {
      this.form.setValue(Array.from(new Set([...value, ...items])));
    } else {
      this.form.setValue(value.filter(item => !items.includes(item)));
    }
  }
  hideGroup(group: StaticGroup, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.hidden[group.label] = !this.hidden[group.label];
  }

}


@Pipe({ name: 'getMode' })
export class GetModePipe implements PipeTransform {
  transform(value: string[], group: StaticGroup | StaticGroup[]) {
    if (Array.isArray(group)) return getRootMode(group, value);
    return getMode(group, value);
  }
}
