import { ToolkitModule, MOVIES } from '../storybook';
import { CarouselModule } from './carousel.module';
import { object } from '@storybook/addon-knobs';
import { MatLayoutModule } from '../layout/layout.module';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';


export default {
  title: 'Bf Carousel'
};

export const bfCarousel = () => ({
  moduleMetadata: { imports: [CarouselModule, ToolkitModule, MovieCardModule, MatLayoutModule] },
  name: 'Bf Carousel',
  template: `
    <storybook-toolkit>
      <h1 title>Bf Carousel</h1>
      <div layout>
        <bf-carousel flex>
          <ng-container *ngFor="let movie of movies">
            <movie-card shrink [movie]="movie" [col]="2"></movie-card>
          </ng-container>
        </bf-carousel>
      </div>
    </storybook-toolkit>
  `,
  props: {
    movies: object('movies', MOVIES.slice(0, 10))
  },
});