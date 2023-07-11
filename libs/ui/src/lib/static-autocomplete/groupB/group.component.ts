import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GroupScope, Scope, StaticGroup, staticGroups } from '@blockframes/model';
import { FormStaticValueArray } from '@blockframes/utils/form';

@Component({
  selector: 'group-multiselect',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMultiselectComponent implements OnInit {
  @Input() control: FormStaticValueArray<Scope>;
  @Input() scope: GroupScope;
  @Input() label: string;
  @Input() selectIcon = 'world';
  @Input() filterPlaceholder: string;

  search = new FormControl('');

  // groups status
  groups: StaticGroup[];
  indeterminate: Record<string, boolean>;
  checked: Record<string, boolean>;

  //items status
  items: string[];
  selectable: Record<string, boolean>; //will depend on the search value
  visible: Record<string, boolean>; //will depend on the expand buttons of each group

  ngOnInit() {
    this.groups = staticGroups[this.scope];
    this.items = this.getAllItems(this.groups);

    this.selectable = this.items.reduce((aggr, item) => ({ ...aggr, [item]: true }), {});
    this.visible = this.items.reduce((aggr, item) => ({ ...aggr, [item]: true }), {});

    this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
    this.checked = this.getChecked(this.control.value, this.selectable);

    this.search.valueChanges.subscribe(filter => {
      this.selectable = this.getSelectable(this.groups, filter);
      this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
      this.checked = this.getChecked(this.control.value, this.selectable);
      for (const group of this.groups) {
        if (
          Object.keys(this.selectable).some(item => group.items.includes(item)) &&
          this.visible[group.label] &&
          filter.length > 2
        )
          this.toggleVisibility(group.label);
      }
    });

    this.control.valueChanges.subscribe(value => {
      this.indeterminate = this.getIndeterminate(value, this.selectable);
      this.checked = this.getChecked(value, this.selectable);
    });
  }

  getAllItems(groups: StaticGroup[]): string[] {
    return groups.reduce((items, group) => [...items, ...group.items], []);
  }

  getSelectable(groups: StaticGroup[], filter?: string): Record<string, boolean> {
    const selectable: Record<string, boolean> = {};
    const lowerCaseFilter = filter.toLowerCase();

    for (const { label, items } of groups) {
      const lowerCaseLabel = label.toLowerCase();
      const filteredItems = items.filter(item => item.toLowerCase().includes(lowerCaseFilter));

      if (lowerCaseLabel.includes(lowerCaseFilter) || filteredItems.length > 0) {
        selectable[label] = true;
        filteredItems.forEach(item => {
          selectable[item] = true;
        });
      }
    }

    return selectable;
  }

  getIndeterminate(controlValue: string[], selectableItems: Record<string, boolean>): Record<string, boolean> {
    const allVisibleItems = selectableItems
      ? Object.keys(selectableItems).filter(item => item[0] === item[0].toLowerCase())
      : this.items;
    const indeterminate = { all: controlValue.length > 0 && controlValue.length < allVisibleItems.length };
    for (const { label, items } of this.groups) {
      const groupVisibleItems = items.filter(item => selectableItems[item]);
      const groupVisibleSelectedItems = groupVisibleItems.filter(item => controlValue.includes(item));
      indeterminate[label] = groupVisibleSelectedItems.length > 0 && groupVisibleSelectedItems.length < groupVisibleItems.length;
    }
    return indeterminate;
  }

  getChecked(controlValue: string[], selectableItems?: Record<string, boolean>): Record<string, boolean> {
    const allVisibleItems = selectableItems
      ? Object.keys(selectableItems).filter(item => item[0] === item[0].toLowerCase())
      : this.items;
    const checked = { all: controlValue.length === allVisibleItems.length };

    for (const { label, items } of this.groups) {
      const groupVisibleItems = items.filter(item => selectableItems[item]);
      const groupVisibleSelectedItems = groupVisibleItems.filter(item => controlValue.includes(item));
      checked[label] = groupVisibleSelectedItems.length === groupVisibleItems.length;
    }
    return checked;
  }

  checkGroup(groupLabel: string, selectable: Record<string, boolean>, checked: boolean) {
    const previous = this.control.value;
    const groupItems = this.groups.filter(group => group.label === groupLabel && group.items).flatMap(group => group.items);
    const selectableItems = groupItems.filter(item => selectable[item]);
    this.control.setValue(
      checked ? [...new Set([...previous, ...selectableItems])] : previous.filter(item => !selectableItems.includes(item))
    );
  }

  checkAll(checked: boolean) {
    this.control.setValue(checked ? this.items : []);
  }

  toggleVisibility(groupLabel: string) {
    this.visible[groupLabel] = !this.visible[groupLabel];
    this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
    this.checked = this.getChecked(this.control.value, this.selectable);
  }

  resetSearch() {
    this.search.setValue('');
  }
}
