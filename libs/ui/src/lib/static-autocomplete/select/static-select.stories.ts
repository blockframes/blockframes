import { FormControl } from '@angular/forms';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { StaticSelectModule } from './static-select.module';
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
      <static-select [scope]="scope" [control]="control" type="constant"></static-select>
  </storybook-toolkit>
`,
  props: {
    scope: text('scope', 'genres'),
    control: new FormControl()
  }
});


