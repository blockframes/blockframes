import { FormControl } from '@angular/forms';
import { InputAutocompleteModule } from './input-autocomplete.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { text } from '@storybook/addon-knobs';

export default {
  title: 'Input Autocomplete'
};

export const staticInput = () => ({
  moduleMetadata: { imports: [InputAutocompleteModule, ToolkitModule] },
  name: 'Input Autocomplete',
  template: `
    <storybook-toolkit>
      <h1 title>Input Autocomplete</h1>
        <input-autocomplete [scope]="scope" [control]="control"></input-autocomplete>
    </storybook-toolkit>
  `,
  props: {
    scope: text('scope', 'GENRES'),
    control: new FormControl()
  }
});