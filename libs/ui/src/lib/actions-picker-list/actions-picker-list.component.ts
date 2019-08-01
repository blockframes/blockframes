import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectionListChange } from '@angular/material';

export interface ActionPickerListItem<T> {
  title: string;
  payload: T;
}

@Component({
  selector: 'actions-picker-list',
  templateUrl: './actions-picker-list.component.html',
  styleUrls: ['./actions-picker-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPickerListComponent<T> {
  @Input() public items: ActionPickerListItem<T>[];
  @Output() public picked = new EventEmitter<T[]>();

  public forwardToParent(event: MatSelectionListChange) {
    const selected = event.source.selectedOptions.selected;
    const selectedValues = selected.map(x => x.value.payload);
    return this.picked.emit(selectedValues);
  }
}
