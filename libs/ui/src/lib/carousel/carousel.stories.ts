import { object } from '@storybook/addon-knobs';
import { CarouselModule } from './carousel.module';
import { ToolkitModule, MOVIES } from '../storybook';

export default {
  title: 'Carousel'
};

export const carousel = () => ({
  moduleMetadata: { imports: [CarouselModule, ToolkitModule] },
  name: 'Movie Banner',
  template: `
    <storybook-toolkit>
      <h1 title>Movie Banner</h1>
      <bf-carousel></bf-carousel>
    </storybook-toolkit>
  `,
  props: {
    movie: object('movie', MOVIES[0]),
  }
});
