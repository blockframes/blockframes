import { FormControl } from '@angular/forms';
import { StaticInputModule } from './static-input.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { text } from '@storybook/addon-knobs';

export default {
  title: 'Static Input'
};

export const staticInput = () => ({
  moduleMetadata: { imports: [StaticInputModule, ToolkitModule] },
  name: 'Static Input',
  template: `
    <storybook-toolkit>
      <h1 title>Static Input</h1>
        <static-input [scope]="scope" [control]="control"></static-input>
    </storybook-toolkit>
  `,
  props: {
    scope: text('scope', 'GENRES'),
    control: new FormControl()
  }
});