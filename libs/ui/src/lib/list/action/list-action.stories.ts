import { ToolkitModule } from '@blockframes/ui/storybook';
import { object } from '@storybook/addon-knobs';
import { NOTIFICATIONS } from '../../storybook/mock';
import { ListActionModule } from './list-action.module';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

export default {
  title: 'List Action'
};

export const listAction = () => ({
  moduleMetadata: { imports: [ListActionModule, ToolkitModule, MatListModule, MatMenuModule] },
  name: 'List Action',
  template: `
    <storybook-toolkit>
      <h1 title>List Action</h1>
      <bf-list-action [actions]="notifications">
        <ng-template listActionItem let-item>
          <mat-list-item>{{ item.isRead | json }}</mat-list-item>
        </ng-template>
        <list-action-menu>
          <span mat-menu-item>cool</span>
        </list-action-menu>
      </bf-list-action>
    </storybook-toolkit>
  `,
  props: {
    notifications: object('notifications', NOTIFICATIONS.slice(0, 10))
  }
});