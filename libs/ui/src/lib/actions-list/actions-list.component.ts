import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface ActionItem {
  routerLink: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'actions-list',
  templateUrl: './actions-list.component.html',
  styleUrls: ['./actions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsListComponent {
  @Input() public items: ActionItem[];
}
