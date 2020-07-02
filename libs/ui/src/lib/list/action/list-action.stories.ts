import { ToolkitModule } from '@blockframes/ui/storybook';
import { object } from '@storybook/addon-knobs';
import { NOTIFICATIONS } from '../../storybook/mock';
import { ListActionModule } from './list-action.module';

export default {
  title: 'List Action'
};

export const listAction = () => ({
  moduleMetadata: { imports: [ListActionModule, ToolkitModule] },
  name: 'List Action',
  template: `
    <storybook-toolkit>
      <h1 title>List Action</h1>
      <bf-list-action>
        <ng-template listActionHeader>Today</ng-template>
        <ng-template listActionPagination>Cool</ng-template>
      </bf-list-action>
    </storybook-toolkit>
  `,
  props: {
    notifications: object('notifications', NOTIFICATIONS)
  }
});