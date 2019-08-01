import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

export interface ActionPickerItem<T> {
  title: string;
  payload: T;
}

@Component({
  selector: 'actions-picker',
  templateUrl: './actions-picker.component.html',
  styleUrls: ['./actions-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPickerComponent<T> {
  @Input() public items: ActionPickerItem<T>[];
  @Output() public picked = new EventEmitter<T>();
}
