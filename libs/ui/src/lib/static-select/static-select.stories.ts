import { ToolkitModule } from '@blockframes/ui/storybook';
import { StaticSelectModule } from '@blockframes/ui/static-select/static-select.module';
import { text } from '@storybook/addon-knobs';


export default {
  title: 'Static Select'
};

export const staticSelect = () => ({
  moduleMetadata: { imports: [StaticSelectModule, ToolkitModule] },
  name: 'Static Select',
  template: `
  <storybook-toolkit>
    <h1 title>Static Select</h1>
      <static-select [scope]="scope"></static-select>
  </storybook-toolkit>
`,
  props: {
    scope: text('scope', 'GENRES')
  }
});


