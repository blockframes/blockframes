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
import { map, startWith, shareReplay } from "rxjs/operators";
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
  private sub?: Subscription;
  trackByLabel = (i: number, group: StaticGroup) => group.label;
  onOpen = () => null;
  modes: Record<string, Observable<GroupMode>> = {};
  filteredGroups$: Observable<StaticGroup[]>;
  groups$ = new BehaviorSubject<StaticGroup[]>([]);

  form = new FormControl([]);
  // defer the startWith value with subscription happens to get first value
  value$ = defer(() => this.form.valueChanges.pipe(
    startWith(this.form.value),
    shareReplay(1)
  ));
  hidden: Record<string, boolean> = {}
  
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

  }

  // Control value accessor

  writeValue(value: string[]): void {
    this.form.reset(value);
  }
  registerOnChange(fn: any): void {
    this.sub = this.form.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onOpen = () => fn(true);
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  // all check

  checkAll(checked: boolean) {
    if (!checked) {
      this.form.reset([]);
    } else {
      const value = this.groups.reduce((items, group) => items.concat(group.items), []);
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