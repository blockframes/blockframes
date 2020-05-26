import { object } from '@storybook/addon-knobs';
import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';
import { MovieSlideModule } from './slide.module';

export default {
  title: 'Movie Slide'
};

export const movieSlide = () => ({
  moduleMetadata: { imports: [MovieSlideModule, ToolkitModule] },
  name: 'Movie Slide',
  template: `
    <storybook-toolkit>
      <h1 title>Movie Slide</h1>
      <movie-slide [movie]="movie">
        <movie-slide-cta>Some cool CTA actions</movie-slide-cta>
        <movie-slide-actions>Some cool ACTIONS actions</movie-slide-actions>
      </movie-slide>
    </storybook-toolkit>
  `,
  props: {
    movie: object('movie', MOVIES[0]),
  }
});