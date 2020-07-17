import { ToolkitModule } from '@blockframes/ui/storybook';
import { FormListModule } from './form-list.module';
import { FormListComponent } from './form-list.component';
import { object } from '@storybook/addon-knobs';
import { FormListTableModule } from './table/form-list-table.module';

export default {
  title: 'Form-List'
};

export const bfSlider = () => ({
  moduleMetadata: { imports: [ToolkitModule, FormListModule, FormListTableModule] },
  name: 'Form-List',
  component: FormListComponent,
  template: `
  <storybook-toolkit>
  <h1 title>Form-List</h1>
    <bf-form-list [displayedColumns]="displayedColumns">
      <bf-form-list-table>
        <ng-template colRef="cool" let-scoring>{{ scoring }}</ng-template> 
        <ng-template colRef="Director" let-didi>{{ didi }}</ng-template> 
        <ng-template colRef="Döner" let-dono>{{ dono }}</ng-template> 
      </bf-form-list-table>
    </bf-form-list>
  </storybook-toolkit>
  `,
  props: {
    displayedColumns: object('displayColumn', ['cool', 'Director', 'Döner'])
  }
});

