import { object } from '@storybook/addon-knobs';
import { MovieBannerModule } from './banner.module';
import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';

export default {
  title: 'Movie Banner'
};

export const movieBanner = () => ({
  moduleMetadata: { imports: [MovieBannerModule, ToolkitModule] },
  name: 'Movie Banner',
  template: `
    <storybook-toolkit>
      <h1 title>Movie Banner</h1>
      <movie-banner [movie]="movie"></movie-banner>
    </storybook-toolkit>
  `,
  props: {
    movie: object('movie', MOVIES[0]),
  }
});


