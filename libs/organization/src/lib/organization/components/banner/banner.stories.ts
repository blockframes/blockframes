import { object } from '@storybook/addon-knobs';
import { OrganizationBannerModule } from './banner.module';
import { ToolkitModule, ORGS } from '@blockframes/ui/storybook';
import { OrganizationBannerComponent } from './banner.component';
import { RouterTestingModule } from '@angular/router/testing';

export default {
  title: 'Featured Sales Agent Banner'
};

export const organizationMinimalCard = () => ({
  moduleMetadata: { imports: [OrganizationBannerModule, ToolkitModule, RouterTestingModule] },
  name: 'Featured Sales Agent Banner',
  component: OrganizationBannerComponent,
  template: `
    <storybook-toolkit>
      <h1 title>Featured Sales Agent Banner</h1>
      <org-banner [org]="org"></org-banner>
    </storybook-toolkit>
  `,
  props: {
    org: object('org', ORGS[0]),
  }
});
