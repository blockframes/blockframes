import { object } from '@storybook/addon-knobs';
import { ToolkitModule, MOVIES } from '@blockframes/ui/storybook';
import { MovieSliderModule } from './slider.module';

export default {
  title: 'Movie Slider'
};

export const movieSlider = () => ({
  moduleMetadata: { imports: [MovieSliderModule, ToolkitModule] },
  name: 'Movie Slider',
  template: `
    <storybook-toolkit>
      <h1 title>Movie Slider</h1>
      <movie-slider [movie]="movie"></movie-slider>
    </storybook-toolkit>
  `,
  props: {
    movie: object('movie', MOVIES),
  }
});