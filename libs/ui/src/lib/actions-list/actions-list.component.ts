import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

interface ActionItemLink {
  routerLink: string;
  icon?: string;
  matIcon?: string;
  title: string;
  description: string;
  button?: {
    matIcon: string;
    action: () => any;
  }
}

interface ActionItemAction {
  action: () => any;
  icon?: string;
  matIcon?: string;
  title: string;
  description: string;
}

export type ActionItem = ActionItemLink | ActionItemAction

@Component({
  selector: 'actions-list',
  templateUrl: './actions-list.component.html',
  styleUrls: ['./actions-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActionsListComponent {
  @Input() public items: ActionItem[];
}
