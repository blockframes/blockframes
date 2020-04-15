import { object } from '@storybook/addon-knobs';
import { MovieCardModule } from './card.module';
import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';

export default {
  title: 'Movie Card'
};

export const movieCard = () => ({
  moduleMetadata: { imports: [MovieCardModule, ToolkitModule] },
  name: 'Movie Card',
  template: `
    <storybook-toolkit>
      <h1 title>Movie Card</h1>
      <movie-card [movie]="movie"></movie-card>
    </storybook-toolkit>
  `,
  props: {
    movie: object('movie', MOVIES[0]),
  }
});


