import {
  ChangeDetectionStrategy,
  Component,
  Input,
  forwardRef,
  Pipe, PipeTransform,
} from "@angular/core";
import {
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from "@angular/forms";
import { BehaviorSubject, combineLatest, Observable, Subscription, defer } from "rxjs";
import { map, startWith, shareReplay, pairwise } from "rxjs/operators";
import { Scope, StaticGroup, staticGroups, staticModel } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';


type GroupMode = 'indeterminate' | 'checked' | 'unchecked';

function filter([groups, text]: [StaticGroup[], string]) {
  if (!text) return groups;
  const search = text.toLowerCase();
  const result: StaticGroup[] = [];
  for (const group of groups) {
    if (group.label.toLowerCase().includes(search)) {
      result.push(group);
    } else {
      const items = group.items.filter(item => {
        return item.toLowerCase().includes(search);
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

@Component({
  selector: 'static-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StaticGroupComponent),
      multi: true
    }
  ]
})
export class StaticGroupComponent implements ControlValueAccessor {
  private _scope: Scope;
  private subs: Subscription[] = [];
  trackByLabel = (i: number, group: StaticGroup) => group.label;
  modes: Record<string, Observable<GroupMode>> = {};
  filteredGroups$: Observable<StaticGroup[]>;
  groups$ = new BehaviorSubject<StaticGroup[]>([]);

  form = new FormControl([]);
  // defer the startWith value with subscription happens to get first value
  value$ = defer(() => this.form.valueChanges.pipe(
    startWith(this.form.value || []),
    shareReplay(1)
  ));
  hidden: Record<string, boolean> = {}
  // all items includes the values of checked items which are not in the filter
  allItems: string[] = [];

  @Input() displayAll = '';
  @Input() @boolean required = false;
  @Input() @boolean disabled = false;
  @Input() set scope(scope: Scope) {
    this._scope = scope;
    this.groups$.next(staticGroups[scope]);
  }
  get scope() {
    return this._scope;
  }
  get groups() {
    return this.groups$.getValue();
  }

  search = new FormControl();
  constructor() {
    this.filteredGroups$ = combineLatest([
      this.groups$.asObservable(),
      this.search.valueChanges.pipe(startWith(this.search.value))
    ]).pipe(map(filter));

    const sub = combineLatest([
      this.filteredGroups$.pipe(map(getItems)),
      this.form.valueChanges.pipe(pairwise())
    ]).subscribe(([filteredItems, [prev, next]]) => {
      if (!!prev) {
        // checked but filtered out values
        const hiddenValues = prev.filter(value => !filteredItems.includes(value));
        if (!!hiddenValues.length && !next.includes(hiddenValues[0])) {
          // add back the values
          this.form.setValue(next.concat(hiddenValues));
        }
      }
      this.allItems = this.form.value;
    })
    this.subs.push(sub);
  }

  onOpen(opened: boolean) {
    if (!opened) {
      this.form.setValue(this.allItems);
      this.search.setValue('');
    }
  }

  // Control value accessor

  writeValue(value: string[]): void {
    this.form.reset(value);
  }
  registerOnChange(fn: any): void {
    const sub = this.form.valueChanges.subscribe(fn);
    this.subs.push(sub);
  }
  registerOnTouched() {}
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy() {
    for (const sub of this.subs) {
      sub.unsubscribe();
    }
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

@Pipe({ name: 'triggerDisplay' })
export class TriggerDisplayValue implements PipeTransform {
  transform(value: string[], groups: StaticGroup[], scope: Scope, all?: string) {
    const allItems = groups.reduce((items, group) => items.concat(group.items), []);
    if (allItems.length === value.length) return all;
    return groups.map(group => {
      const items = [];
      for (const item of group.items) {
        if (value.includes(item)) items.push(staticModel[scope][item]);
      }
      return items.length === group.items.length
        ? group.label
        : items;
    })
      .sort((a, b) => typeof a === 'string' ? -1 : 1)
      .map(item => typeof item === 'string' ? item : item.join(', '))
      .filter(v => !!v)
      .join(', ');
  }
}