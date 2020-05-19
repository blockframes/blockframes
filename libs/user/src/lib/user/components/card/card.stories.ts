
import { object } from '@storybook/addon-knobs';
import { UserCardModule } from './card.module'
import { USERS } from '@blockframes/ui/storybook/mock';
import { ToolkitModule } from '@blockframes/ui/storybook/toolkit/toolkit.module';

export default {
  title: 'User Card'
};

export const userCard = () => ({
  moduleMetadata: { imports: [UserCardModule, ToolkitModule] },
  name: 'User Card',
  template: `
    <storybook-toolkit>
      <h1 title>User Card</h1>
        <user-card [user]="user"></user-card>
    </storybook-toolkit>
  `,
  props: {
    user: object('user', USERS[2])
  }
});