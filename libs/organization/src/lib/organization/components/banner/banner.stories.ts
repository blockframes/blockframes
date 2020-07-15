import { object } from '@storybook/addon-knobs';
import { OrganizationBannerModule } from './banner.module';
import { ToolkitModule, ORGS, MOVIES } from '@blockframes/ui/storybook';
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
      <org-banner [org]="org" [movies]="movies"></org-banner>
    </storybook-toolkit>
  `,
  props: {
    org: object('org', ORGS[0]),
    movies: getMovies()
  }
});

function getMovies() {
  return MOVIES.filter(movie => movie?.main?.storeConfig?.status === 'accepted' && movie?.main?.storeConfig?.appAccess.festival).slice(0, 4);
}