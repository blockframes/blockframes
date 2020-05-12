import { ToolkitModule, MOVIES } from '../storybook';
import { CarouselModule } from './carousel.module';
import { object } from '@storybook/addon-knobs';

export default {
  title: 'Bf Carousel'
};

export const bfCarousel = () => ({
  moduleMetadata: { imports: [CarouselModule, ToolkitModule] },
  name: 'Bf Carousel',
  template: `
    <storybook-toolkit>
      <h1 title>Bf Carousel</h1>
      <bf-carousel [movies]="movies"></bf-carousel>
    </storybook-toolkit>
  `,
   props: {
    movies: object('movies', MOVIES)
  } 
});