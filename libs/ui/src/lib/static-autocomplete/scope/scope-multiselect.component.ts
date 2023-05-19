// Angular
import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';

// Blockframes
import { Scope, staticModel } from '@blockframes/model';
import { FormStaticValueArray } from '@blockframes/utils/form';

// RxJs
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

function getVisible(items: string[]) {
  const visible: Record<string, boolean> = {};
  for (const item of items) {
    visible[item] = true;
  }
  return visible;
}

@Component({
  selector: 'scope-multiselect',
  templateUrl: './scope-multiselect.component.html',
  styleUrls: ['./scope-multiselect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeMultiselectComponent implements OnInit {
  @Input() control: FormStaticValueArray<Scope>;
  @Input() scope: Scope;
  @Input() label: string;
  @Input() selectIcon = 'world';
  @Input() filterPlaceholder: string;

  search = new FormControl('');

  items: string[];
  selectedItems = [];

  indeterminate: Observable<boolean>;
  checked: Observable<boolean>;

  visible = this.search.valueChanges.pipe(
    startWith(''),
    map(value => (typeof value === 'string' ? value : this.lastFilter)),
    map(filter => getVisible(this.filter(filter)))
  );

  lastFilter = '';

  ngOnInit() {
    this.items = Object.keys(staticModel[this.scope]);
    this.indeterminate = this.control.valueChanges.pipe(map(value => !!value.length && value.length < this.items.length));
    this.checked = this.control.valueChanges.pipe(map(value => value.length === this.items.length));
  }

  filter(filter: string) {
    this.lastFilter = filter;
    if (filter) return this.items.filter(option => staticModel[this.scope][option].toLowerCase().includes(filter.toLowerCase()));
    return this.items.slice();
  }

  checkAll(checked: MatCheckboxChange) {
    if (!checked) return this.control.reset([]);
    return this.control.setValue(this.items);
  }

  resetSearch() {
    return this.search.setValue('');
  }
}
