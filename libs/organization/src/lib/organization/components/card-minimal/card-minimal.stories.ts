import { object } from '@storybook/addon-knobs';
import { OrganizationCardMinimalModule } from './card-minimal.module';
import { ToolkitModule, ORGS } from '@blockframes/ui/storybook';
import { OrganizationCardMinimalComponent } from './card-minimal.component';
import { RouterTestingModule } from '@angular/router/testing';

export default {
  title: 'Organization Minimal Card'
};

export const organizationMinimalCard = () => ({
  moduleMetadata: { imports: [OrganizationCardMinimalModule, ToolkitModule, RouterTestingModule] },
  name: 'Organizaion Minimal Card',
  component: OrganizationCardMinimalComponent,
  template: `
    <storybook-toolkit>
      <h1 title>Organizaion Minimal Card</h1>
      <org-card-minimal [org]="org"></org-card-minimal>
    </storybook-toolkit>
  `,
  props: {
    org: object('org', ORGS[0]),
  }
});
