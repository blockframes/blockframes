import { ToolkitModule } from '@blockframes/ui/storybook';
import { FooterModule } from './footer.module';

export default {
  title: 'Bf Footer'
};

export const bfFooter = () => ({
  moduleMetadata: { imports: [FooterModule, ToolkitModule] },
  name: 'Bf Footer',
  template: `
    <storybook-toolkit>
      <h1 title>Bf Footer</h1>
      <bf-footer></bf-footer>
    </storybook-toolkit>
  `
});