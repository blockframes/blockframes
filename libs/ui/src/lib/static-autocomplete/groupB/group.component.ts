import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { GroupScope, Scope, StaticGroup, staticGroups } from '@blockframes/model';
import { FormStaticValueArray } from '@blockframes/utils/form';
import { Subscription } from 'rxjs';

@Component({
  selector: 'group-multiselect',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMultiselectComponent implements OnInit, OnDestroy {
  @Input() control: FormStaticValueArray<Scope>;
  @Input() scope: GroupScope;
  @Input() label: string;
  @Input() selectIcon = 'world';
  @Input() filterPlaceholder: string;
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  search = new FormControl('');

  // groups status
  groups: StaticGroup[];
  indeterminate: Record<string, boolean>;
  checked: Record<string, boolean>;

  //items status
  items: string[];
  selectable: Record<string, boolean>; //will depend on the search value
  visible: Record<string, boolean>; //will depend on the expand buttons of each group

  private subs: Subscription[] = [];

  ngOnInit() {
    this.groups = staticGroups[this.scope];
    this.items = this.getAllItems(this.groups);

    this.selectable = this.items.reduce((aggr, item) => ({ ...aggr, [item]: true }), {});
    this.visible = this.items.reduce((aggr, item) => ({ ...aggr, [item]: true }), {});

    this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
    this.checked = this.getChecked(this.control.value, this.selectable);

    const filterSub = this.search.valueChanges.subscribe(filter => {
      this.selectable = this.getSelectable(this.groups, filter);
      this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
      this.checked = this.getChecked(this.control.value, this.selectable);
      for (const group of this.groups) {
        const groupHasSelectableItems = Object.keys(this.selectable).some(item => group.items.includes(item));
        const isGroupVisible = this.visible[group.label];
        if (groupHasSelectableItems && isGroupVisible && filter.length > 2) this.toggleVisibility(group.label);
      }
    });

    const formSub = this.control.valueChanges.subscribe(value => {
      this.indeterminate = this.getIndeterminate(value, this.selectable);
      this.checked = this.getChecked(value, this.selectable);
    });

    this.subs.push(filterSub, formSub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s?.unsubscribe());
  }

  getAllItems(groups: StaticGroup[]): string[] {
    return groups.reduce((items, group) => [...items, ...group.items], []);
  }

  getSelectable(groups: StaticGroup[], filter?: string): Record<string, boolean> {
    const selectable: Record<string, boolean> = {};
    const lowerCaseFilter = filter.toLowerCase();

    for (const { label, items } of groups) {
      const lowerCaseLabel = label.toLowerCase();
      const selectableItems = lowerCaseLabel.includes(lowerCaseFilter)
        ? items
        : items.map(i => i.toLowerCase()).filter(item => item.includes(lowerCaseFilter));

      if (lowerCaseLabel.includes(lowerCaseFilter) || selectableItems.length > 0) {
        selectable[label] = true;
        selectableItems.forEach(item => {
          selectable[item] = true;
        });
      }
    }

    return selectable;
  }

  getIndeterminate(controlValue: string[], selectableItems: Record<string, boolean>): Record<string, boolean> {
    const allVisibleItems = this.getAllVisibleItems(selectableItems);
    const indeterminate = { all: controlValue.length > 0 && controlValue.length < allVisibleItems.length };
    for (const { label, items } of this.groups) {
      const groupVisibleItems = items.filter(item => selectableItems[item]);
      const groupVisibleSelectedItems = groupVisibleItems.filter(item => controlValue.includes(item));
      indeterminate[label] = groupVisibleSelectedItems.length > 0 && groupVisibleSelectedItems.length < groupVisibleItems.length;
    }
    return indeterminate;
  }

  getChecked(controlValue: string[], selectableItems?: Record<string, boolean>): Record<string, boolean> {
    const allVisibleItems = this.getAllVisibleItems(selectableItems);
    const checked = { all: !!controlValue.length && controlValue.length === allVisibleItems.length };

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

  getAllVisibleItems(selectableItems?: Record<string, boolean>) {
    return selectableItems ? Object.keys(selectableItems).filter(item => item[0] === item[0].toLowerCase()) : this.items;
  }

  onOpen() {
    this.resetSearch();
    this.searchInput.nativeElement.focus();
  }

  resetSearch() {
    this.search.setValue('');
  }
}
