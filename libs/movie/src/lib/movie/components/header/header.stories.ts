import { object } from '@storybook/addon-knobs';
import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';
import { MovieHeaderModule } from './header.module';

export default {
  title: 'Movie Header'
};

export const movieHeader = () => ({
  moduleMetadata: { imports: [MovieHeaderModule, ToolkitModule] },
  name: 'Header',
  template: `
    <storybook-toolkit>
      <h1 title>Movie Header</h1>
      <movie-header [movie]="movie">
        <movie-header-preferences>
          <h3>Hello</h3>
        </movie-header-preferences>
        <movie-header-cta>
        <button>Cool button</button>
        </movie-header-cta>
        <movie-header-actions>
        <h3>World</h3>
      </movie-header-actions>
      </movie-header>
    </storybook-toolkit>
  `,
  props: {
    movie: object('movie', MOVIES[0]),
  }
});