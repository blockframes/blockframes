import { ToolkitModule, MOVIES } from '../storybook';
import { CarouselModule } from './carousel.module';
import { object } from '@storybook/addon-knobs';
import { MatLayoutModule } from '../layout/layout.module';
import { DisplayNameModule } from '@blockframes/utils/pipes';


export default {
  title: 'Bf Carousel'
};

export const bfCarousel = () => ({
  moduleMetadata: { imports: [CarouselModule, ToolkitModule, MatLayoutModule, DisplayNameModule] },
  name: 'Bf Carousel',
  template: `
    <storybook-toolkit>
      <h1 title>Bf Carousel</h1>
      <div layout>
        <bf-carousel flex>
          <ng-container *ngFor="let movie of movies">
          <div [col]="2" carouselItem>
          <!-- used a stripped down html from movie card, cause this component uses the router under the hood and
          that will throw in storybook -->
            <figure>
              <div class="overlay">
                <a> View More </a>
              </div>
            </figure>
            <article>
            <h6>{{ movie.title.international }}</h6>
            <p class="mat-caption">{{ movie.directors | displayName }}</p>
            </article>
            </div>
          </ng-container>
        </bf-carousel>
      </div>
    </storybook-toolkit>
  `,
  props: {
    movies: object('movies', MOVIES.slice(0, 15))
  },
});
