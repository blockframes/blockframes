import { Component, ChangeDetectionStrategy, OnInit, Input, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { GroupScope, Scope, StaticGroup, getStaticGroups, preferredLanguage, staticModel, staticModeli18n } from '@blockframes/model';
import { FormStaticValueArray } from '@blockframes/utils/form';
import { MatSelect } from '@angular/material/select';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '../../global-modal/global-modal.component';
import { DetailedGroupComponent } from '../../detail-modal/detailed.component';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'group-multiselect',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupMultiselectComponent implements OnInit, OnDestroy {
  @Input() control: FormStaticValueArray<Scope>;
  @Input() withoutValues: string[] = [];
  @Input() scope: GroupScope;
  @Input() label: string;
  @Input() selectIcon = 'world';
  @Input() filterPlaceholder: string;
  @Input() displayAll: string;
  @Input() required = false;
  @Input() requiredMsg = 'This field is mandatory';
  @Input() hint = null;
  @Input() @boolean bfi18n: boolean;
  @Input() @boolean showDetails = true;
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  // mySelect and scrollTopBeforeSelection are used to prevent jumps when selecting an option
  @ViewChild('mySelect', { static: true }) mySelect: MatSelect;
  private scrollTopBeforeSelection: number;

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

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    const lang = this.bfi18n ? preferredLanguage() : undefined;
    const groups: StaticGroup[] = getStaticGroups(this.scope, lang);
    if (this.withoutValues.length) {
      for (const group of groups) {
        /* eslint-disable */
        group.items = (group.items as any[]).filter((item: string) => !this.withoutValues.includes(item));
      }
    }
    this.groups = groups.filter(g => g.items.length && !this.withoutValues.includes(g.key));
    this.items = this.getAllItems(this.groups);

    this.selectable = this.items.reduce((aggr, item) => ({ ...aggr, [item]: true }), {});
    this.visible = this.groups.reduce((aggr, group) => ({ ...aggr, [group.label]: true }), {});

    this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
    this.checked = this.getChecked(this.control.value, this.selectable);

    const filterSub = this.search.valueChanges.subscribe(filter => {
      this.selectable = this.getSelectable(this.groups, filter);
      this.indeterminate = this.getIndeterminate(this.control.value, this.selectable);
      this.checked = this.getChecked(this.control.value, this.selectable);
      for (const group of this.groups) {
        const groupHasSelectableItems = Object.keys(this.selectable).some(item => group.items.includes(item));
        const isGroupVisible = this.visible[group.label];
        if (groupHasSelectableItems && !isGroupVisible && filter.length > 2) this.toggleVisibility(group.label);
      }
    });

    const formSub = this.control.valueChanges.subscribe(value => {
      this.indeterminate = this.getIndeterminate(value, this.selectable);
      this.checked = this.getChecked(value, this.selectable);
    });

    // store the scroll value of the selected option
    const selectOpeningSub = this.mySelect.openedChange.subscribe(open => {
      if (open) {
        this.mySelect.panel.nativeElement.addEventListener(
          'scroll',
          event => (this.scrollTopBeforeSelection = event.target.scrollTop)
        );
      }
    });

    // restore the scroll after each option selected
    const antiScrollSub = this.mySelect.optionSelectionChanges.subscribe(() => {
      if (this.mySelect.panel) this.mySelect.panel.nativeElement.scrollTop = this.scrollTopBeforeSelection;
    });

    this.subs.push(filterSub, formSub, selectOpeningSub, antiScrollSub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s?.unsubscribe());
  }

  getAllItems(groups: StaticGroup[]): string[] {
    return groups.reduce((items, group) => [...items, ...group.items], []);
  }

  getSelectable(groups: StaticGroup[], filter?: string): Record<string, boolean> {
    const lang = this.bfi18n ? preferredLanguage() : undefined;
    const scope = (lang && staticModeli18n[lang] && staticModeli18n[lang][this.scope]) ? staticModeli18n[lang][this.scope] : staticModel[this.scope];
    const selectable: Record<string, boolean> = {};
    const lowerCaseFilter = filter.toLowerCase();

    for (const { label, items } of groups) {
      const lowerCaseLabel = label.toLowerCase();
      const selectableItems = lowerCaseLabel.includes(lowerCaseFilter)
        ? items
        : items
          .map(i => scope[i].toLowerCase()) // get the displayed value
          .filter(item => item.includes(lowerCaseFilter)) // compare above value with filter
          .map(itemValue => getKeyIfExists(this.scope, itemValue, lang)); // retrieve item key

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
    const indeterminate = { all: controlValue?.length > 0 && controlValue?.length < allVisibleItems.length };
    for (const { label, items } of this.groups) {
      const groupVisibleItems = items.filter(item => selectableItems[item]);
      const groupVisibleSelectedItems = groupVisibleItems.filter(item => controlValue?.includes(item));
      indeterminate[label] = groupVisibleSelectedItems.length > 0 && groupVisibleSelectedItems.length < groupVisibleItems.length;
    }
    return indeterminate;
  }

  getChecked(controlValue: string[], selectableItems?: Record<string, boolean>): Record<string, boolean> {
    const allVisibleItems = this.getAllVisibleItems(selectableItems);
    const checked = { all: !!controlValue?.length && controlValue?.length === allVisibleItems.length };

    for (const { label, items } of this.groups) {
      const groupVisibleItems = items.filter(item => selectableItems[item]);
      const groupVisibleSelectedItems = groupVisibleItems.filter(item => controlValue?.includes(item));
      checked[label] = groupVisibleSelectedItems.length === groupVisibleItems.length;
    }
    return checked;
  }

  checkGroup(groupLabel: string, selectable: Record<string, boolean>, checked: boolean) {
    const previous = this.control.value;
    const groupItems = this.groups.filter(group => group.label === groupLabel && group.items).flatMap(group => group.items);
    const selectableItems = groupItems.filter(item => selectable[item]);
    this.control.markAsDirty();
    this.control.setValue(
      checked ? [...new Set([...previous, ...selectableItems])] : previous.filter(item => !selectableItems.includes(item))
    );
  }

  checkAll(checked: boolean) {
    this.control.markAsDirty();
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

  onSearchPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData.getData('text');
    const pastedValues = pastedText.split(',').map(item => item.trim());
    const pastedItems = new Set(
      pastedValues
        .map(item => item.toLowerCase())
        .map(item => {
          for (const group of this.groups) {
            if (group.label.toLowerCase() === item) return group.items;
            const key = getKeyIfExists(this.scope, item);
            if (key) return key;
          }
        })
        .flat()
        .filter(item => !!item)
    );
    this.control.markAsDirty();
    this.control.setValue(Array.from(pastedItems));
    this.mySelect.close();
  }

  resetSearch() {
    this.search.setValue('');
  }

  openGroupModal() {
    this.dialog.open(DetailedGroupComponent, {
      data: createModalData({ items: this.control.value, scope: this.scope, bfi18n: this.bfi18n }),
      autoFocus: false,
    });
  }
}
