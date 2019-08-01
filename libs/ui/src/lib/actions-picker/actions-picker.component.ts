import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface ActionPickerItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'actions-picker',
  templateUrl: './actions-picker.component.html',
  styleUrls: ['./actions-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsPickerComponent {
  @Input() public items: ActionPickerItem[];
}
