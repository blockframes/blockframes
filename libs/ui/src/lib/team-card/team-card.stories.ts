import { TeamCardModule } from './team-card.module';
import { ToolkitModule, USERS } from '../storybook';
import { object } from '@storybook/addon-knobs';


export default {
  title: 'Team Card'
};

export const teamCard = () => ({
  moduleMetadata: { imports: [TeamCardModule, ToolkitModule] },
  name: 'Team Card',
  template: `
    <storybook-toolkit>
      <h1 title>Team Card</h1>
        <team-card [user]="user"></team-card>
    </storybook-toolkit>
  `,
   props: {
    user: object('user', USERS[2]) 
  } 
});