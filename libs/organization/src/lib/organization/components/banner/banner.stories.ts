import { object } from '@storybook/addon-knobs';
import { OrganizationBannerModule } from './banner.module';
import { ToolkitModule, ORGS, MOVIES } from '@blockframes/ui/storybook';
import { OrganizationBannerComponent } from './banner.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { FlexLayoutModule } from '@angular/flex-layout';

export default {
  title: 'Featured Sales Agent Banner'
};

export const organizationMinimalCard = () => ({
  moduleMetadata: { imports: [OrganizationBannerModule, ToolkitModule, RouterTestingModule, MatLayoutModule, FlexLayoutModule] },
  name: 'Featured Sales Agent Banner',
  component: OrganizationBannerComponent,
  template: `
    <storybook-toolkit>
      <h1 title>Featured Sales Agent Banner</h1>
      <org-banner layout flex [org]="org" [col]="2"></org-banner>
    </storybook-toolkit>
  `,
  props: {
    org: object('org', getObject()),
  }
});

function getObject() {
  const org = ORGS[0];
  org.movies = MOVIES.filter(movie => movie?.main?.storeConfig?.status === 'accepted' && movie?.main?.storeConfig?.appAccess.festival).slice(0, 4);
  return org;
}