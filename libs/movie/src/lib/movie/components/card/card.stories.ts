import { object } from '@storybook/addon-knobs';
import { MovieCardModule } from './card.module';
import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';
import { CardComponent } from './card.component';

export default {
  title: 'Movie Card'
};

export const movieCard = () => ({
  moduleMetadata: { imports: [MovieCardModule, ToolkitModule] },
  name: 'Card',
  component: CardComponent,
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
