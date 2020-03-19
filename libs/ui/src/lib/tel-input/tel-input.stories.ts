import { FormControl } from '@angular/forms';
import { TelInputModule } from './tel-input.module';
import { ToolkitModule } from '@blockframes/ui/storybook';
import { MatFormFieldModule } from '@angular/material/form-field';

export default {
  title: 'Tel Input'
};

export const telInput = () => ({
  moduleMetadata: { imports: [TelInputModule, MatFormFieldModule, ToolkitModule] },
  name: 'Tel Input',
  template: `
    <storybook-toolkit>
      <h1 title>Tel Input</h1>
        <mat-form-field appearance="outline">
            <tel-input [form]="form" placeholder="Your Number"></tel-input>
        </mat-form-field>
    </storybook-toolkit>
  `,
   props: {
    form: new FormControl()
  } 
});